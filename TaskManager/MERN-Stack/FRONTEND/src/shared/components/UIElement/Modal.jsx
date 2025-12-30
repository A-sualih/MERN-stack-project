import React from 'react'
import { useRef } from 'react';
import ReactDOM from 'react-dom'; 
import './Modal.css';
import Backdrop from './Backdrop';
import { CSSTransition } from 'react-transition-group';
const ModalOverlay = React.forwardRef((props, ref) => {
  const content = (
    <div ref={ref} className={`modal ${props.className}`} style={props.style}>
      <header className={`modal__header ${props.headerClass}`}>
        <h2>{props.header}</h2>
      </header>

      <form onSubmit={props.onSubmit ? props.onSubmit : event => event.preventDefault()}>
        <div className={`modal__content ${props.contentClass}`}>
          {props.children}
        </div>
        <footer className={`modal__footer ${props.footerClass}`}>
          {props.footer}
        </footer>
      </form>
    </div>
  );

  return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
});

const Modal = (props) => {
  const nodeRef=useRef(null);
  return (
    <React.Fragment>
      {props.show && <Backdrop onClick={props.onCancel}/>}
      <CSSTransition 
      in={props.show}
       mountOnEnter
       unmountOnExit
       timeout={200}
       classNames="modal"
       nodeRef={nodeRef}
       >
     <ModalOverlay ref={nodeRef} {...props} />
      </CSSTransition>
    </React.Fragment>
  )
}

export default Modal
