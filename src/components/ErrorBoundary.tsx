import { Component, type ReactNode, type ErrorInfo, useContext } from 'react'
import { LocaleContext } from '../i18n/LocaleContext'

interface Props {
  children: ReactNode
  /** Reset key — changing this clears the error state (e.g. pass current view name) */
  resetKey?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <LocaleContext.Consumer>
          {({ t: tr }) => (
            <div role="alert" style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.85)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⛈️</div>
              <p style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{tr.somethingWentWrong}</p>
              <p style={{ fontSize: 14, marginTop: 8, opacity: 0.65, lineHeight: 1.5 }}>
                {this.state.error?.message ?? tr.unexpectedError}
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                style={{ marginTop: 20, padding: '11px 24px', borderRadius: 16, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}
              >
                {tr.tryAgain}
              </button>
            </div>
          )}
        </LocaleContext.Consumer>
      )
    }
    return this.props.children
  }
}
