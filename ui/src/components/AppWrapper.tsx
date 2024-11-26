import { Component, PropsWithChildren } from "react";

type AppWrapperState = {
  hasError: boolean;
};

export class AppWrapper extends Component<PropsWithChildren, AppWrapperState> {
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
    if (this.state.hasError) {
      return <p>An unexpected error has occured</p>;
    }
    return <>{this.props.children}</>;
  }
}
