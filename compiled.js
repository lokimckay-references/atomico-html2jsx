(function () {
    'use strict';

    /**
     * compare 2 array
     * ```js
     * isEqualArray([1,2,3,4],[1,2,3,4]) // true
     * isEqualArray([1,2,3,4],[1,2,3])   // false
     * isEqualArray([5,1,2,3],[1,2,3,5]) // false
     * isEqualArray([],[]) // true
     * ```
     * @param {any[]} before
     * @param {any[]} after
     * @returns {boolean}
     */
    /**
     * Determine if the value is considered a function
     * @param {any} value
     */

    const isFunction = value => typeof value == "function";
    /**
     * Determines if the value is considered an object
     * @param {any} value
     */

    const isObject = value => typeof value == "object";
    const {
      isArray
    } = Array;

    class PropError {
      /**
       *
       * @param {HTMLElement} target
       * @param {string} message
       * @param {string} value
       */
      constructor(target, message, value) {
        this.message = message;
        this.target = target;
        this.value = value;
      }

    }

    /**
     * The Any type avoids the validation of prop types
     * @type {null}
     **/

    const Any = null;
    /**
     * Attributes considered as valid boleanos
     **/

    const TRUE_VALUES = {
      true: 1,
      "": 1,
      1: 1
    };
    /**
     * Constructs the setter and getter of the associated property
     * only if it is not defined in the prototype
     * @param {Object} prototype - CustomElement prototype
     * @param {string} prop - Name of the reactive property to associate with the customElement
     * @param {any} schema - Structure to be evaluated for the definition of the property
     * @param {Attrs} attrs - Dictionary of attributes to properties
     * @param {Values} values - Values to initialize the customElements
     */

    function setPrototype(prototype, prop, schema, attrs, values) {
      /**@type {Schema} */
      let {
        type,
        reflect,
        event,
        value,
        attr = getAttr(prop)
      } = isObject(schema) && schema != Any ? schema : {
        type: schema
      };
      let isCallable = !(type == Function || type == Any);
      Object.defineProperty(prototype, prop, {
        configurable: true,

        /**
         * @this {import("./custom-element").AtomThis}
         * @param {any} newValue
         */
        set(newValue) {
          let oldValue = this[prop];
          let {
            error,
            value
          } = filterValue(type, isCallable && isFunction(newValue) ? newValue(oldValue) : newValue);

          if (error && value != null) {
            throw new PropError(this, `The value defined for prop '${prop}' must be of type '${type.name}'`, value);
          }

          if (oldValue == value) return;
          this.update({
            [prop]: value
          });
          /**
           * 1.7.0 >, this position reduces the amount of updates to the DOM and render
           */

          if (event) dispatchEvent(this, event);
          /**
           * attribute mirroring must occur if component is mounted
           */

          this.updated.then(() => {
            if (reflect) {
              this._ignoreAttr = attr;
              reflectValue(this, type, attr, this[prop]);
              this._ignoreAttr = null;
            }
          });
        },

        /**
         * @this {import("./custom-element").AtomThis}
         */
        get() {
          return this._props[prop];
        }

      });

      if (value != null) {
        values[prop] = value;
      }

      attrs[attr] = {
        prop,
        type
      };
    }
    /**
     * Dispatch an event
     * @param {Element} node - DOM node to dispatch the event
     * @param {InternalEvent & InternalEventInit} event - Event to dispatch on node
     */

    const dispatchEvent = (node, {
      type,
      base = CustomEvent,
      ...eventInit
    }) => node.dispatchEvent(new base(type, eventInit));
    /**
     * Transform a Camel Case string to a Kebab case
     * @param {string} prop - string to apply the format
     * @returns {string}
     */

    const getAttr = prop => prop.replace(/([A-Z])/g, "-$1").toLowerCase();
    /**
     * reflects an attribute value of the given element as context
     * @param {Element} host
     * @param {any} type
     * @param {string} attr
     * @param {any} value
     */


    const reflectValue = (host, type, attr, value) => value == null || type == Boolean && !value ? host.removeAttribute(attr) : host.setAttribute(attr, isObject(value) ? JSON.stringify(value) : type == Boolean ? "" : value);
    /**
     * transform a string to a value according to its type
     * @param {any} type
     * @param {string} value
     * @returns {any}
     */


    const transformValue = (type, value) => type == Boolean ? !!TRUE_VALUES[value] : type == Number ? Number(value) : type == Array || type == Object ? JSON.parse(value) : value;
    /**
     * Filter the values based on their type
     * @param {any} type
     * @param {any} value
     * @returns {{error?:boolean,value:any}}
     */

    const filterValue = (type, value) => type == Any ? {
      value
    } : type != String && value === "" ? {
      value: null
    } : {}.toString.call(value) == `[object ${type.name}]` ? {
      value,
      error: type == Number && Number.isNaN(value)
    } : {
      value,
      error: true
    };
    /**
     * Type any, used to avoid type validation.
     * @typedef {null} Any
     */

    /**
     * @typedef {Object} InternalEventInit
     * @property {typeof CustomEvent|typeof Event} [base] - Optional constructor to initialize the event
     * @property {boolean} [bubbles] - indicating whether the event bubbles. The default is false.
     * @property {boolean} [cancelable] - indicating whether the event will trigger listeners outside of a shadow root.
     * @property {boolean} [composed] - indicating whether the event will trigger listeners outside of a shadow root.
     * @property {any} [detail] - indicating whether the event will trigger listeners outside of a shadow root.
     */

    /**
     * Interface used by dispatchEvent to automate event firing
     * @typedef {Object} InternalEvent
     * @property {string} type - type of event to dispatch.
     */

    /**
     * @typedef {Object<string, {prop:string,type:Function}>} Attrs
     */

    /**
     * @typedef {Object<string, any>} Values
     */

    /**
     * @typedef {Object} Schema
     * @property {any} [type] - data type to be worked as property and attribute
     * @property {string} [attr] - allows customizing the name as an attribute by skipping the camelCase format
     * @property {boolean} [reflect] - reflects property as attribute of node
     * @property {InternalEvent} [event] - Allows to emit an event every time the property changes
     * @property {any} [value] - defines a default value when instantiating the component
     */

    /**
     * HOOK_CURRENT_REF is defined in synchronous execution time at the moment
     * of rendering a hook, this variable allows sharing
     * its context only when executed by load.
     * @type {Ref}
     */
    /**
     * Create a hook store
     * @param {()=>void} [update] - Send the update request
     * @param {any} [host] - Host context to share by the useHost hook
     */

    function createHooks(update, host) {
      /**
       * map of states associated with an increasing position
       * @type {Object<string,Hook>}
       **/
      let hooks = {};
      /**
       * announces that the updates have finished allowing the
       * execution of the collectors
       * @param {1|2} type - 0 = useLayoutEffect 1 = useEffect
       * @param {boolean} [unmounted]
       */


      function cleanEffectsType(type, unmounted) {
        for (let index in hooks) {
          let hook = hooks[index];
          if (hook[type]) hook[0] = hook[type](hook[0], unmounted);
        }
      }
      /**
       * Create a global context to share with
       * the hooks synchronously and temporarily with the callback execution
       * @param {()=>any} callback - callback that consumes the global context through hooks
       * @returns {any}
       */


      function load(callback) {
        let value;

        try {
          value = callback();
        } finally {
        }

        return value;
      }
      /**
       * Create a 2-step effect cleaning cycle,
       * first useLayoutEffect and then useEffect,
       * the latter is cleared after the callback is
       * executed as a return
       * @param {boolean} [unmounted]
       * @returns {()=>void}
       */


      function cleanEffects(unmounted) {
        cleanEffectsType(1, unmounted);
        return () => {
          cleanEffectsType(2, unmounted);
          if (unmounted) hooks = {};
        };
      }

      return {
        load,
        cleanEffects
      };
    }
    /**
     * @typedef {[Render,CleanEffect,CleanEffect]} Hook - Hook instance
     */

    /**
     * @callback Render - Function that runs in rendering
     * @param {any} state
     * @returns {any}
     */

    /**
     * @callback CleanEffect - Function that runs after rendering
     * @param {any} state
     * @param {boolean} [unmounted]
     * @returns {any}
     */

    /**
     * @callback Use - Create or retrieve the cursor from a hook
     * @param {Render} render
     * @param {CleanEffect} [cleanLayoutEffect]
     * @param {CleanEffect} [cleanEffect]
     */

    /**
     *
     * @typedef {Object} Ref - Global reference to the hook execution context
     * @property {()=>void} update
     * @property {any} host
     * @property {Use} use
     */

    // from the node to verify 2 if they have changed

    const VAL_FROM_PROPS = {
      id: 1,
      className: 1,
      checked: 1,
      value: 1,
      selected: 1
    }; // Map of attributes that escape the property analysis

    const PROPS_AS_ATTRS = {
      list: 1,
      type: 1,
      size: 1,
      form: 1,
      width: 1,
      height: 1,
      src: 1,
      href: 1,
      slot: 1
    }; // escapes from diffProps compare process

    const INTERNAL_PROPS = {
      shadowDom: 1,
      renderOnce: 1,
      children: 1,
      key: 1
    }; // Immutable for comparison of empty properties

    const EMPTY_PROPS = {}; // Immutable for empty children comparison

    const EMPTY_CHILDREN = []; // Used to identify text type nodes when using Node.nodeType

    const TYPE_TEXT = 3; // Alias for document

    const $ = document; // Fragment marker

    class Mark extends Text {
      // Prevents internal manipulation in renderChildren
      get nodeType() {
        return -1;
      }

    } // Internal marker to know if the Vnode comes from Atomico

    const $$ = Symbol(); // Default ID used to store the Vnode state

    const ID = Symbol();
    /**
     * @param {string|null|RawNode} type
     * @param {object} [p]
     * @param  {...any} args
     */

    function h(type, p, ...args) {
      let props = p || EMPTY_PROPS;
      let {
        children
      } = props;
      children = children != null ? children : args.length ? args : EMPTY_CHILDREN;
      const raw = type ? type instanceof Node ? 1 : type.prototype instanceof HTMLElement && 2 : false;
      return {
        $$,
        type,
        props,
        children,
        // key for lists by keys
        key: props.key,
        // define if the node declares its shadowDom
        shadow: props.shadowDom,
        // allows renderings to run only once
        once: props.renderOnce,
        // defines whether the type is a childNode `1` or a constructor `2`
        raw,
        // defines whether to use the second parameter for document.createElement
        is: props.is
      };
    }
    /**
     * Create or update a node
     * Node: The declaration of types through JSDOC does not allow to compress
     * the exploration of the parameters
     * @param {Vnode} newVnode
     * @param {RawNode} node
     * @param {ID} [id]
     * @param {boolean} [hydrate]
     * @param {boolean} [isSvg]
     * @returns {Element}
     */

    function render(newVnode, node, id = ID, hydrate, isSvg) {
      let isNewNode; // If the node maintains the source vnode it escapes from the update tree

      if (node && node[id] && node[id].vnode == newVnode || newVnode.$$ != $$) return node; // The process only continues when you may need to create a node

      if (newVnode || !node) {
        isSvg = isSvg || newVnode.type == "svg";
        isNewNode = newVnode.type != "host" && (newVnode.raw == 1 ? node != newVnode.type : newVnode.raw == 2 ? !(node instanceof newVnode.type) : node ? node.localName != newVnode.type : !node);

        if (isNewNode) {
          if (newVnode.ref) {
            return newVnode.ref.cloneNode(true);
          } else if (newVnode.type != null) {
            newVnode.ref = node = newVnode.raw == 1 ? newVnode.type : newVnode.raw == 2 ? new newVnode.type() : isSvg ? $.createElementNS("http://www.w3.org/2000/svg", newVnode.type) : $.createElement(newVnode.type, newVnode.is ? {
              is: newVnode.is
            } : undefined);
          }
        }
      }

      let {
        vnode = EMPTY_PROPS,
        cycle = 0,
        fragment,
        handlers
      } = node[id] ? node[id] : EMPTY_PROPS;
      /**
       * @type {Vnode["props"]}
       */

      let {
        children = EMPTY_CHILDREN,
        props = EMPTY_PROPS
      } = vnode;
      /**
       * @type {Handlers}
       */

      handlers = isNewNode ? {} : handlers || {};
      /**
       * Escape a second render if the vnode.type is equal
       */

      if (newVnode.once && !isNewNode) return node;

      if (newVnode.shadow && !node.shadowRoot) {
        node.attachShadow({
          mode: "open"
        });
      }

      if (newVnode.props != props) {
        diffProps(node, props, newVnode.props, handlers, isSvg);
      }

      if (newVnode.children !== children) {
        let nextParent = newVnode.shadow ? node.shadowRoot : node;
        fragment = renderChildren(newVnode.children,
        /**
         * @todo for hydration use attribute and send childNodes
         */
        fragment, nextParent, id, // add support to foreignObject, children will escape from svg
        !cycle && hydrate, isSvg && newVnode.type == "foreignObject" ? false : isSvg);
      }

      cycle++;
      node[id] = {
        vnode: newVnode,
        handlers,
        fragment,
        cycle
      };
      return node;
    }
    /**
     *
     * @param {Element} parent
     * @param {boolean} [hydrate]
     * @returns
     */

    function createFragment(parent, hydrate) {
      const s = new Mark("");
      const e = new Mark("");
      parent[hydrate ? "prepend" : "append"](s);
      parent.append(e);
      return {
        s,
        e
      };
    }
    /**
     * This method should only be executed from render,
     * it allows rendering the children of the virtual-dom
     * @param {any} children
     * @param {Fragment} fragment
     * @param {RawNode|ShadowRoot} parent
     * @param {any} id
     * @param {boolean} [hydrate]
     * @param {boolean} [isSvg]
     */


    function renderChildren(children, fragment, parent, id, hydrate, isSvg) {
      children = children == null ? null : isArray(children) ? children : [children];
      /**
       * @type {Fragment}
       */

      let nextFragment = fragment || createFragment(parent, hydrate);
      let {
        s,
        e,
        k
      } = nextFragment;
      /**
       * @type {Keyed}
       */

      let nk;
      /**
       * Eliminate intermediate nodes that are not used in the process in keyed
       * @type {Set<ChildNode>}
       */

      let rk = k && new Set();
      /**
       * RULES: that you should never exceed "c"
       * @type {ChildNode}
       */

      let c = s;
      /**
       * @todo analyze the need to clean up certain tags
       * local recursive instance, flatMap consumes the array, swapping positions
       * @param {any[]} children
       */

      function flatMap(children) {
        let {
          length
        } = children;

        for (let i = 0; i < length; i++) {
          let child = children[i];
          let type = typeof child;

          if (child == null || type == "boolean" || type == "function") {
            continue;
          } else if (isArray(child)) {
            flatMap(child);
            continue;
          } else if (type == "object" && child.$$ != $$) {
            continue;
          }

          let key = child.$$ && child.key;
          let childKey = k && key != null && k.get(key); // check if the displacement affected the index of the child with
          // assignment of key, if so the use of nextSibling is prevented

          if (c != e && c === childKey) {
            rk.delete(c);
          } else {
            c = c == e ? e : c.nextSibling;
          }

          let childNode = k ? childKey : c;
          let nextChildNode = childNode; // text node diff

          if (!child.$$) {
            let text = child + "";

            if (nextChildNode.nodeType != TYPE_TEXT) {
              nextChildNode = new Text(text);
            } // Only one Text node falls in this block
            // @ts-ignore
            else if (nextChildNode.data != text) {
              // @ts-ignore
              nextChildNode.data = text;
            }
          } else {
            // node diff, either update or creation of the new node.
            nextChildNode = render(child, childNode, id, hydrate, isSvg);
          }

          if (nextChildNode != c) {
            k && rk.delete(nextChildNode);

            if (!childNode || k) {
              parent.insertBefore(nextChildNode, c); //

              if (k && c != e) rk.add(c);
            } else if (childNode == e) {
              parent.insertBefore(nextChildNode, e);
            } else {
              parent.replaceChild(nextChildNode, childNode);
              c = nextChildNode;
            }
          } // if there is a key, a map of keys is created


          if (key != null) {
            nk = nk || new Map();
            nk.set(key, nextChildNode);
          }
        }
      }

      children && flatMap(children);
      c = c == e ? e : c.nextSibling;

      if (fragment && c != e) {
        // cleaning of remnants within the fragment
        while (c != e) {
          let r = c;
          c = c.nextSibling;
          r.remove();
        }
      }

      rk && rk.forEach(node => node.remove());
      nextFragment.k = nk;
      return nextFragment;
    }
    /**
     *
     * @param {RawNode} node
     * @param {Object} props
     * @param {Object} nextProps
     * @param {boolean} isSvg
     * @param {Object} handlers
     **/

    function diffProps(node, props, nextProps, handlers, isSvg) {
      for (let key in props) {
        if (!(key in nextProps)) {
          setProperty(node, key, props[key], null, isSvg, handlers);
        }
      }

      for (let key in nextProps) {
        setProperty(node, key, props[key], nextProps[key], isSvg, handlers);
      }
    }
    /**
     *
     * @param {RawNode} node
     * @param {string} key
     * @param {any} prevValue
     * @param {any} nextValue
     * @param {boolean} isSvg
     * @param {Handlers} handlers
     */

    function setProperty(node, key, prevValue, nextValue, isSvg, handlers) {
      key = key == "class" && !isSvg ? "className" : key; // define empty value

      prevValue = prevValue == null ? null : prevValue;
      nextValue = nextValue == null ? null : nextValue;

      if (key in node && VAL_FROM_PROPS[key]) {
        prevValue = node[key];
      }

      if (nextValue === prevValue || INTERNAL_PROPS[key] || key[0] == "_") return;

      if (key[0] == "o" && key[1] == "n" && (isFunction(nextValue) || isFunction(prevValue))) {
        setEvent(node, key.slice(2), nextValue, handlers);
      } else if (key == "ref") {
        if (nextValue) nextValue.current = node;
      } else if (key == "style") {
        let style = node.style;
        prevValue = prevValue || "";
        nextValue = nextValue || "";
        let prevIsObject = isObject(prevValue);
        let nextIsObject = isObject(nextValue);

        if (prevIsObject) {
          for (let key in prevValue) {
            if (nextIsObject) {
              if (!(key in nextValue)) setPropertyStyle(style, key, null);
            } else {
              break;
            }
          }
        }

        if (nextIsObject) {
          for (let key in nextValue) {
            let value = nextValue[key];
            if (prevIsObject && prevValue[key] === value) continue;
            setPropertyStyle(style, key, value);
          }
        } else {
          style.cssText = nextValue;
        }
      } else {
        let attr = key[0] == "$" ? key.slice(1) : key;

        if (attr === key && (!isSvg && !PROPS_AS_ATTRS[key] && key in node || isFunction(nextValue) || isFunction(prevValue))) {
          node[key] = nextValue == null ? "" : nextValue;
        } else if (nextValue == null) {
          node.removeAttribute(attr);
        } else {
          node.setAttribute(attr, isObject(nextValue) ? JSON.stringify(nextValue) : nextValue);
        }
      }
    }
    /**
     *
     * @param {RawNode} node
     * @param {string} type
     * @param {Listener} [nextHandler]
     * @param {Handlers} [handlers]
     */

    function setEvent(node, type, nextHandler, handlers) {
      // add handleEvent to handlers
      if (!handlers.handleEvent) {
        /**
         * {@link https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener#The_value_of_this_within_the_handler}
         **/
        handlers.handleEvent = event => handlers[event.type].call(node, event);
      }

      if (nextHandler) {
        // create the subscriber if it does not exist
        if (!handlers[type]) {
          //the event configuration is only subscribed at the time of association
          let options = nextHandler.capture || nextHandler.once || nextHandler.passive ? Object.assign({}, nextHandler) : null;
          node.addEventListener(type, handlers, options);
        } // update the associated event


        handlers[type] = nextHandler;
      } else {
        // 	delete the associated event
        if (handlers[type]) {
          node.removeEventListener(type, handlers);
          delete handlers[type];
        }
      }
    }
    /**
     *
     * @param {*} style
     * @param {string} key
     * @param {string} value
     */

    function setPropertyStyle(style, key, value) {
      let method = "setProperty";

      if (value == null) {
        method = "removeProperty";
        value = null;
      }

      if (~key.indexOf("-")) {
        style[method](key, value);
      } else {
        style[key] = value;
      }
    }
    /**
     * @typedef {Map<any,ChildNode>} Keyed - Map of nodes referenced by an index
     */

    /**
     * @typedef {Object} Fragment - Node list start and end position marker
     * @property {Comment} s
     * @property {Comment} e
     * @property {Keyed} [k]
     */

    /**
     * @typedef {ReturnType<h>} Vnode
     */

    /**
     *
     * @typedef {Object} HandleEvent
     * @property {(event:Event|CustomEvent)=>any} handleEvent
     */

    /**
     *
     * @typedef {((event:Event|CustomEvent)=>any) & AddEventListenerOptions } Listener
     */

    /**
     * @typedef {Object<string,Listener> & HandleEvent } Handlers
     */

    /**
     * @typedef {Object<string,any>} StyleFill
     */

    /**
     * @typedef {Object} Style
     * @property {string} cssText
     */

    /**
     * @typedef { any } RawNode
     */

    /**
     * @typedef {symbol|string} ID
     */

    const options = {
      /**
       * CSSStyleSheet support
       * @type {boolean}
       */
      //@ts-ignore
      sheet: !!document.adoptedStyleSheets,

      /**
       * define if you use rendering from the server
       * @type {(component:import("./element/custom-element").Context)=>void}
       */
      ssr: null
    };

    /**
     * Class to extend for lifecycle assignment
     * @param {any} component - Function to transform into customElement
     * @param {Base} [Base] - Class to extend for lifecycle assignment
     */

    function c(component, Base = HTMLElement) {
      /**
       * @type {import("./set-prototype").Attrs}
       */
      let attrs = {};
      /**
       * @type {import("./set-prototype").Values}
       */

      let values = {};
      let {
        props,
        styles
      } = component;
      let Atom = class extends Base {
        constructor() {
          super();

          this._setup();

          this._render = () => component({ ...this._props
          });

          for (let prop in values) this[prop] = values[prop];
        }
        /**
         * @returns {Style[]|Style}
         */


        static get styles() {
          //@ts-ignore
          return [super.styles, styles];
        }

        async _setup() {
          // _setup only continues if _props has not been defined
          if (this._props) return;
          this._props = {};
          this.mounted = new Promise(resolve => this.mount = resolve);
          this.unmounted = new Promise(resolve => this.unmount = resolve);
          this.symbolId = this.symbolId || Symbol();
          let hooks = createHooks();
          let prevent;
          let firstRender = true;
          let hydrate = ("hydrate" in this.dataset);

          this.update = props => {
            if (!prevent) {
              prevent = true;
              /**
               * this.updated is defined at the runtime of the render,
               * if it fails it is caught by mistake to unlock prevent
               */

              this.updated = (this.updated || this.mounted).then(() => {
                try {
                  render(hooks.load(this._render), this, this.symbolId, firstRender && hydrate);
                  prevent = false;

                  if (firstRender) {
                    firstRender = false; // @ts-ignore

                    applyStyles(this);
                  }

                  return !options.ssr && hooks.cleanEffects();
                } finally {
                  // Remove lock in case of synchronous error
                  prevent = false;
                }
              }) // next tick
              .then(cleanEffect => {
                cleanEffect && cleanEffect();
              });
            }

            if (props) {
              for (let prop in props) this._props[prop] = props[prop];
            }

            return this.updated;
          };

          this.update();
          await this.unmounted;
          hooks.cleanEffects(true)();
        }

        connectedCallback() {
          this.mount(); //@ts-ignore

          super.connectedCallback && super.connectedCallback();
        }

        async disconnectedCallback() {
          //@ts-ignore
          super.disconnectedCallback && super.disconnectedCallback(); // The webcomponent will only resolve disconnected if it is
          // actually disconnected of the document, otherwise it will keep the record.

          await this.mounted;
          !this.isConnected && this.unmount();
        }
        /**
         * @param {string} attr
         * @param {(string|null)} oldValue
         * @param {(string|null)} value
         */


        attributeChangedCallback(attr, oldValue, value) {
          if (attrs[attr]) {
            // _ignoreAttr exists temporarily
            // @ts-ignore
            if (attr === this._ignoreAttr || oldValue === value) return; // Choose the property name to send the update

            let {
              prop,
              type
            } = attrs[attr];
            this[prop] = transformValue(type, value);
          } else {
            // If the attribute does not exist in the scope attrs, the event is sent to super
            // @ts-ignore
            super.attributeChangedCallback(attr, oldValue, value);
          }
        }

        static get observedAttributes() {
          // See if there is an observedAttributes declaration to match with the current one
          // @ts-ignore
          let superAttrs = super.observedAttributes || [];

          for (let prop in props) {
            setPrototype(this.prototype, prop, props[prop], attrs, values);
          }

          return Object.keys(attrs).concat(superAttrs);
        }

      };
      return Atom;
    }
    /**
     * Attach the css to the shadowDom
     * @param {Base &  {shadowRoot: ShadowRoot, constructor: {styles: Style[] }} } host
     */

    function applyStyles(host) {
      let {
        styles
      } = host.constructor;
      let {
        shadowRoot
      } = host;

      if (shadowRoot && styles.length) {
        styles = styles.reduce(function concat(styles, style) {
          isArray(style) ? style.reduce(concat, styles) : style && styles.push(style);
          return styles;
        }, []);

        if (options.sheet) {
          //@ts-ignore
          shadowRoot.adoptedStyleSheets = [...styles];
        } else {
          styles.map(style => // @ts-ignore
          shadowRoot.appendChild(style.cloneNode(true)));
        }
      }
    }
    /**
     * @typedef {Object} ShadowRoot
     * @property {CSSStyleSheet[]} [adoptedStyleSheets]
     * @property {(child:ChildNode)=>void} appendChild
     */

    /**
     * @typedef {typeof HTMLElement} Base
     */

    /**
     * @typedef {Object} Context
     * @property {(value:any)=>void} mount
     * @property {(value:any)=>void} unmount
     * @property {Promise<void>} mounted
     * @property {Promise<void>} unmounted
     * @property {Promise<void>} updated
     * @property {()=>Promise<void>} update
     * @property {Object<string,any>} _props
     * @property {string} [_ignoreAttr]
     * @property {symbol} [symbolId]  - symbolId allows to obtain the symbol id that stores the state of the virtual-dom
     */

    /**
     * @typedef {CSSStyleSheet|HTMLStyleElement} Style
     */

    /**
     * @typedef { ReturnType<c> } Atom
     */

    /**
     * @typedef { InstanceType< Atom > & {_ignoreAttr?: string } } AtomThis
     */

    var n = function (t, s, r, e) {
      var u;
      s[0] = 0;

      for (var h = 1; h < s.length; h++) {
        var p = s[h++],
            a = s[h] ? (s[0] |= p ? 1 : 2, r[s[h++]]) : s[++h];
        3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h]] = a : 6 === p ? e[1][s[++h]] += a + "" : p ? (u = t.apply(a, n(t, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h - 2] = 0, s[h] = u)) : e.push(a);
      }

      return e;
    },
        t = new Map();

    function htm(s) {
      var r = t.get(this);
      return r || (r = new Map(), t.set(this, r)), (r = n(this, r.get(s) || (r.set(s, r = function (n) {
        for (var t, s, r = 1, e = "", u = "", h = [0], p = function (n) {
          1 === r && (n || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h.push(0, n, e) : 3 === r && (n || e) ? (h.push(3, n, e), r = 2) : 2 === r && "..." === e && n ? h.push(4, n, 0) : 2 === r && e && !n ? h.push(5, 0, !0, e) : r >= 5 && ((e || !n && 5 === r) && (h.push(r, 0, e, s), r = 6), n && (h.push(r, n, 0, s), r = 6)), e = "";
        }, a = 0; a < n.length; a++) {
          a && (1 === r && p(), p(a));

          for (var l = 0; l < n[a].length; l++) t = n[a][l], 1 === r ? "<" === t ? (p(), h = [h], r = 3) : e += t : 4 === r ? "--" === e && ">" === t ? (r = 1, e = "") : e = t + e[0] : u ? t === u ? u = "" : e += t : '"' === t || "'" === t ? u = t : ">" === t ? (p(), r = 1) : r && ("=" === t ? (r = 5, s = e, e = "") : "/" === t && (r < 5 || ">" === n[a][l + 1]) ? (p(), 3 === r && (h = h[0]), r = h, (h = h[0]).push(2, 0, r), r = 0) : " " === t || "\t" === t || "\n" === t || "\r" === t ? (p(), r = 2) : e += t), 3 === r && "!--" === e && (r = 4, h = h[0]);
        }

        return p(), h;
      }(s)), r), arguments, [])).length > 1 ? r : r[0];
    }

    const html = htm.bind(h);

    function MyComponent() {
      return h("host", {
        shadowDom: true,
        children: [h("p", {
          children: "this works"
        }), html`<img src="https://placekitten.com/200"></image>`, h("p", {
          children: "this works"
        }), html`<img src="https://placekitten.com/200" />`, h("p", {
          children: "this does not work"
        }), html`<img src="https://placekitten.com/200">`]
      });
    }

    customElements.define("my-component", c(MyComponent));

})();
