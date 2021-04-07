/*
 * Copyright 2021 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';

export type ErrorBoundaryFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

declare function FallbackRender(
  props: ErrorBoundaryFallbackProps,
): React.ReactElement<
  unknown,
  string | React.FunctionComponent | typeof React.Component
> | null;

type ErrorBoundaryProps = {
  fallbackRender: typeof FallbackRender;
};

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<
  React.PropsWithRef<React.PropsWithChildren<ErrorBoundaryProps>>,
  State
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state: State = { error: null };

  resetErrorBoundary = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { fallbackRender } = this.props;

    if (error !== null) {
      return fallbackRender({
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }

    return this.props.children;
  }
}
