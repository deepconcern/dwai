package realtime

import (
	"context"
	"log/slog"
	"sync"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ThreatsChannel is the Postgres notification channel that triggers on
// dangers and grim_portents use to announce that a campaign's known threats
// may have changed (see sql/migrations/0010_fronts.up.sql). The payload is
// the campaign's ID.
const ThreatsChannel = "campaign_threats"

// Signals tells subscribers that something about a campaign changed, with
// no data: the subscriber reloads what it shows (and the API checks what
// it may see). Signals that arrive while one is pending are coalesced, so
// a subscriber never falls behind. Like Broker, the listener runs only
// while there are subscribers.
type Signals struct {
	channel string
	pool    *pgxpool.Pool

	mu          sync.Mutex
	subscribers map[pgtype.UUID]map[chan struct{}]struct{}
	count       int
	listener    *listener
}

// NewSignals returns Signals for a notification channel whose payloads are
// campaign IDs. Nothing runs until the first subscriber arrives.
func NewSignals(pool *pgxpool.Pool, channel string) *Signals {
	return &Signals{channel: channel, pool: pool, subscribers: map[pgtype.UUID]map[chan struct{}]struct{}{}}
}

// Subscribe returns a channel that receives a value whenever the campaign
// is announced. It closes when ctx ends.
func (s *Signals) Subscribe(ctx context.Context, campaignID pgtype.UUID) (<-chan struct{}, error) {
	ch := make(chan struct{}, 1)

	s.mu.Lock()
	if s.subscribers[campaignID] == nil {
		s.subscribers[campaignID] = map[chan struct{}]struct{}{}
	}
	s.subscribers[campaignID][ch] = struct{}{}
	s.count++
	if s.listener == nil {
		ctx, cancel := context.WithCancel(context.Background())
		s.listener = &listener{cancel: cancel, ready: make(chan struct{})}
		go listenLoop(ctx, s.pool, s.channel, s.listener, s.deliver)
	}
	l := s.listener
	s.mu.Unlock()

	go func() {
		<-ctx.Done()
		s.unsubscribe(campaignID, ch)
	}()

	select {
	case <-l.ready:
		return ch, nil
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

func (s *Signals) unsubscribe(campaignID pgtype.UUID, ch chan struct{}) {
	s.mu.Lock()
	defer s.mu.Unlock()

	subs := s.subscribers[campaignID]
	if _, ok := subs[ch]; !ok {
		return
	}

	delete(subs, ch)
	if len(subs) == 0 {
		delete(s.subscribers, campaignID)
	}
	close(ch)

	s.count--
	if s.count == 0 && s.listener != nil {
		s.listener.cancel()
		s.listener = nil
	}
}

// deliver signals an announced campaign's subscribers, skipping any that
// already have a signal pending.
func (s *Signals) deliver(ctx context.Context, payload string) {
	var id pgtype.UUID
	if err := id.Scan(payload); err != nil {
		slog.ErrorContext(ctx, "bad signal", "channel", s.channel, "payload", payload, "error", err)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for ch := range s.subscribers[id] {
		select {
		case ch <- struct{}{}:
		default:
		}
	}
}
