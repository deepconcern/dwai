package realtime

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// listenLoop holds a connection listening on a notification channel until
// ctx ends, reconnecting with backoff if the connection fails, and passes
// each notification's payload to deliver. It closes l.ready once LISTEN
// has first run (or when it gives up).
func listenLoop(ctx context.Context, pool *pgxpool.Pool, channel string, l *listener, deliver func(context.Context, string)) {
	readyOnce := sync.OnceFunc(func() { close(l.ready) })
	defer readyOnce()

	backoff := 100 * time.Millisecond
	for ctx.Err() == nil {
		err := listenOnce(ctx, pool, channel, readyOnce, deliver)
		if ctx.Err() != nil {
			return
		}

		slog.ErrorContext(ctx, "listener failed; reconnecting", "channel", channel, "error", err, "backoff", backoff)
		select {
		case <-time.After(backoff):
		case <-ctx.Done():
			return
		}
		backoff = min(backoff*2, 10*time.Second)
	}
}

// listenOnce runs LISTEN on a dedicated connection and delivers
// notifications until the connection fails or ctx ends.
func listenOnce(ctx context.Context, pool *pgxpool.Pool, channel string, ready func(), deliver func(context.Context, string)) error {
	pooled, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire connection: %w", err)
	}

	// The connection leaves the pool: waiting is interrupted by canceling
	// ctx, which can leave it unusable.
	conn := pooled.Hijack()
	defer func() { _ = conn.Close(context.Background()) }()

	if _, err := conn.Exec(ctx, "LISTEN "+pgx.Identifier{channel}.Sanitize()); err != nil {
		return fmt.Errorf("listen: %w", err)
	}
	ready()

	for {
		n, err := conn.WaitForNotification(ctx)
		if err != nil {
			return fmt.Errorf("wait for notification: %w", err)
		}

		deliver(ctx, n.Payload)
	}
}
