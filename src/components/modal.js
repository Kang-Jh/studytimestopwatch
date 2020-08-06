import { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import '../styles/modal.css';

const modalRoot = document.getElementById('modalRoot');
export default function ({ isOpen, children }) {
  const containerRef = useRef(document.createElement('div'));

  useEffect(() => {
    const container = containerRef.current;
    container.setAttribute('class', 'Modal');
    modalRoot.appendChild(container);

    return () => {
      modalRoot.removeChild(container);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      modalRoot.setAttribute('class', 'open');
    }

    return () => {
      modalRoot.setAttribute('class', '');
    };
  }, [isOpen]);

  if (isOpen) {
    return ReactDOM.createPortal(children, containerRef.current);
  } else {
    return null;
  }
}
