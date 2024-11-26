import clsx from "clsx";
import { Component, PropsWithChildren, Suspense } from "react";
import { Link } from "react-router";

export type PageProps = PropsWithChildren<{
  className?: string | null;
  hasError?: boolean;
  title?: string | null;
}>;

type PageState = { hasError: boolean };

export class Page extends Component<PageProps, PageState> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error(error, errorInfo);
  }

  render() {
    return (
      <>
        <header
          css={(theme) => ({
            borderBottom: "4px solid black",
            marginBottom: theme.spacing[4],
            padding: theme.spacing[2],
          })}
        >
          <nav>
            <Link
              css={(theme) => ({
                color: theme.color.text,
                textDecoration: "none",
                "&:hover": {
                  color: theme.color.text,
                  textDecoration: "none",
                },
              })}
              to="/"
            >
              <h1 css={{ margin: 0 }}>DW</h1>
            </Link>
          </nav>
        </header>
        <main
          className={this.props.className!}
          css={{ marginInline: "auto", maxWidth: "960px" }}
        >
          {this.props.title && <h2>{this.props.title}</h2>}
          {this.state.hasError || this.props.hasError ? (
            <article className={clsx("nes-container", "with-title")}>
              <h3>ERROR</h3>
              <p>An unexpected error has occured.</p>
            </article>
          ) : (
            <Suspense fallback={<p>Loading...</p>}>
              {this.props.children}
            </Suspense>
          )}
        </main>
      </>
    );
  }
}
