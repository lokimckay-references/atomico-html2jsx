import { html, c, h } from "atomico";
import xhtm from "xhtm";
const xhtml = xhtm.bind(h);

function MyComponent() {
  return (
    <host shadowDom>
      <p>{`<img src="https://placekitten.com/64"></image> Atomico HTML`}</p>
      {html`<img src="https://placekitten.com/64"></image>`}
      <p>{`<img src="https://placekitten.com/64" /> Atomico HTML`}</p>
      {html`<img src="https://placekitten.com/64" />`}
      <p>{`<img src="https://placekitten.com/64"> Atomico HTML `}</p>
      {html`<img src="https://placekitten.com/64">`}
      <p>{`<img src="https://placekitten.com/64"> XHTM`}</p>
      {xhtml`<img src="https://placekitten.com/64">`}
    </host>
  );
}

customElements.define("my-component", c(MyComponent));
