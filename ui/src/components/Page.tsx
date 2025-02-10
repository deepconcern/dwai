import { Interpolation, Theme } from "@emotion/react";
import clsx from "clsx";
import { Component, PropsWithChildren, Suspense } from "react";
import { Link } from "react-router";
import { LastRollContext } from "../contexts/LastRollContext";

export type Back = { label: string; to: string };

export type PageProps = PropsWithChildren<{
  back?: string | Back;
  className?: string | null;
  hasError?: boolean;
  title?: string | null;
}>;

type PageState = { hasError: boolean };

const NAV_LINK_CSS: Interpolation<Theme> = (theme) => ({
  color: theme.color.text,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  "&:hover": {
    color: theme.color.text,
    textDecoration: "none",
  },
});

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
      <LastRollContext.Consumer>
        {({ lastRoll }) => (
          <>
            <header
              css={(theme) => ({
                backgroundColor: theme.color.background,
                borderBottom: `4px solid ${theme.color.text}`,
                marginBottom: theme.spacing[4],
                padding: theme.spacing[2],
                position: "sticky",
                top: 0,
                zIndex: 100,
              })}
            >
              <nav
                css={(theme) => ({ display: "flex", gap: theme.spacing[4] })}
              >
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
                <Link css={NAV_LINK_CSS} to="/character-classes">
                  Character Classes
                </Link>
              </nav>
            </header>
            <main
              className={this.props.className!}
              css={(theme) => ({
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                gap: theme.spacing[4],
                marginInline: "auto",
                maxWidth: "960px",
              })}
            >
              {this.props.title && <h2>{this.props.title}</h2>}
              {this.props.back && (
                <Link
                  to={
                    typeof this.props.back === "string"
                      ? this.props.back
                      : this.props.back.to
                  }
                >
                  {typeof this.props.back === "string"
                    ? "< Back"
                    : `< Back to ${this.props.back?.label}`}
                </Link>
              )}
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
            <footer
              css={(theme) => ({
                backgroundColor: theme.color.background,
                borderTop: `4px solid ${theme.color.text}`,
                bottom: 0,
                marginTop: theme.spacing[4],
                padding: theme.spacing[2],
                position: "sticky",
                zIndex: 100,
              })}
            >
              Last Roll: {lastRoll || "N/A"}
            </footer>
          </>
        )}
      </LastRollContext.Consumer>
    );
  }
}
