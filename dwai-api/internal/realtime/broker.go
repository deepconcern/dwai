// Package realtime delivers new campaign chat messages to subscribers
// (Broker), and signals that other campaign data changed (Signals).
//
// It's publish/subscribe over Postgres LISTEN/NOTIFY: inserting a row into
// campaign_messages fires a trigger that sends the message's ID on the
// campaign_messages channel when the transaction commits. Each API instance
// runs one Broker, which listens on that channel, loads each announced
// message, and hands it to that instance's subscribers for its campaign. So
// a message posted to one instance reaches subscribers on every instance,
// with Postgres as the source of truth.
package realtime

import (
	"context"
	"errors"
	"log/slog"
	"sync"

	"github.com/deepconcern/dwai/dwai-api/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Channel is the Postgres notification channel the insert trigger uses (see
// sql/migrations/0008_table_chat.up.sql).
const Channel = "campaign_messages"

// subscriberBuffer is how many messages a subscriber may fall behind before
// it's dropped. A dropped subscription ends, and the client resubscribes and
// reloads the messages it missed.
const subscriberBuffer = 32

// Broker fans out new messages to subscribers. The listener runs only while
// there are subscribers, on its own connection taken out of the pool.
type Broker struct {
	pool *pgxpool.Pool

	mu sync.Mutex
	// subscribers maps a campaign to the channels of its subscribers.
	subscribers map[pgtype.UUID]map[chan db.CampaignMessage]struct{}
	count       int
	// listener is the running listener, or nil when there are no
	// subscribers.
	listener *listener
}

// listener is one run of the LISTEN loop.
type listener struct {
	cancel context.CancelFunc
	// ready is closed once LISTEN has run, so a new subscriber doesn't miss
	// a message posted right after it subscribes.
	ready chan struct{}
}

// NewBroker returns a Broker for the pool. Nothing runs until the first
// subscriber arrives.
func NewBroker(pool *pgxpool.Pool) *Broker {
	return &Broker{pool: pool, subscribers: map[pgtype.UUID]map[chan db.CampaignMessage]struct{}{}}
}

// Subscribe returns a channel of the campaign's new messages, every one of
// them: the caller decides which the viewer may see. The channel closes when
// ctx ends, or if the subscriber falls too far behind.
func (b *Broker) Subscribe(ctx context.Context, campaignID pgtype.UUID) (<-chan db.CampaignMessage, error) {
	ch := make(chan db.CampaignMessage, subscriberBuffer)

	b.mu.Lock()
	if b.subscribers[campaignID] == nil {
		b.subscribers[campaignID] = map[chan db.CampaignMessage]struct{}{}
	}
	b.subscribers[campaignID][ch] = struct{}{}
	b.count++
	if b.listener == nil {
		b.listener = b.startListener()
	}
	l := b.listener
	b.mu.Unlock()

	go func() {
		<-ctx.Done()
		b.unsubscribe(campaignID, ch)
	}()

	select {
	case <-l.ready:
		return ch, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

// unsubscribe removes and closes a subscriber's channel, if it's still
// subscribed, and stops the listener after the last one.
func (b *Broker) unsubscribe(campaignID pgtype.UUID, ch chan db.CampaignMessage) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.removeLocked(campaignID, ch)
}

func (b *Broker) removeLocked(campaignID pgtype.UUID, ch chan db.CampaignMessage) {
	subs := b.subscribers[campaignID]
	if _, ok := subs[ch]; !ok {
		return
	}

	delete(subs, ch)
	if len(subs) == 0 {
		delete(b.subscribers, campaignID)
	}
	close(ch)

	b.count--
	if b.count == 0 && b.listener != nil {
		b.listener.cancel()
		b.listener = nil
	}
}

// startListener starts the LISTEN loop. Call it with b.mu held.
func (b *Broker) startListener() *listener {
	ctx, cancel := context.WithCancel(context.Background())
	l := &listener{cancel: cancel, ready: make(chan struct{})}

	go b.listen(ctx, l)

	return l
}

// listen runs the LISTEN loop on Channel until ctx ends.
func (b *Broker) listen(ctx context.Context, l *listener) {
	listenLoop(ctx, b.pool, Channel, l, b.deliver)
}

// deliver loads an announced message and sends it to its campaign's
// subscribers.
func (b *Broker) deliver(ctx context.Context, payload string) {
	var id pgtype.UUID
	if err := id.Scan(payload); err != nil {
		slog.ErrorContext(ctx, "bad chat notification", "payload", payload, "error", err)
		return
	}

	message, err := db.New(b.pool).SelectCampaignMessage(ctx, id)
	if errors.Is(err, pgx.ErrNoRows) {
		return // its campaign was deleted
	}
	if err != nil {
		slog.ErrorContext(ctx, "failed to load an announced chat message", "id", payload, "error", err)
		return
	}

	b.mu.Lock()
	defer b.mu.Unlock()

	for ch := range b.subscribers[message.CampaignID] {
		select {
		case ch <- message:
		default:
			slog.WarnContext(ctx, "dropping a chat subscriber that fell behind", "campaign", message.CampaignID.String())
			b.removeLocked(message.CampaignID, ch)
		}
	}
}
