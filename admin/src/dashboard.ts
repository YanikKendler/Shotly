import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js'
import authService from './AuthService'

import {createClient} from 'graphql-http'
import Config from './Config'

@customElement('app-dashboard')
export class Dashboard extends LitElement {
    static override styles = css`
        :host {
            font-family: system-ui, sans-serif;
            color: hsl(0, 0%, 90%);
            width: 100%;
        }

        * {
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }

        button {
            background-color: hsl(0, 0%, 30%);
            border: none;
            padding: 0.5rem;
            height: fit-content;
            color: white;
            border-radius: 0.3rem;
            font-weight: bold;
            cursor: pointer;
        }

        .top {
            display: flex;
            justify-content: space-between;
        }
    `

    override connectedCallback() {
        super.connectedCallback()

        console.log(authService.getIdToken())

        this.getUsers()
    }

    async getUsers() {
        console.log(await authService.silentAuth())

        const client = createClient({
            url: Config.backendURL + '/graphql',
            headers: {
                Authorization: `Bearer ${authService.getIdToken()}`,
            },
        })

        const result = await new Promise((resolve, reject) => {
            let result: unknown
            client.subscribe(
                {
                    query: `{ users{
                        id
                        email
                        name
                        createdAt
                    } }`,
                },
                {
                    next: (data) => (result = data),
                    error: reject,
                    complete: () => resolve(result),
                }
            )
        })

        console.log(result)
    }

    override render() {
        return html`
            <div class="top">
                <h1>Shotly Admin Dashboard</h1>
                <button @click=${() => authService.logout()}>Log Out</button>
            </div>
        `
    }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-dashboard': Dashboard;
  }
}
