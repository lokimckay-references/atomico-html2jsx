import { html, c } from "atomico";

function MyComponent() {
  return (
    <host shadowDom>
      <p>this works</p>
      {html`<img src="https://placekitten.com/200"></image>`}
      <p>this works</p>
      {html`<img src="https://placekitten.com/200" />`}
      <p>this does not work</p>
      {html`<img src="https://placekitten.com/200">`}
    </host>
  );
}

customElements.define("my-component", c(MyComponent));
