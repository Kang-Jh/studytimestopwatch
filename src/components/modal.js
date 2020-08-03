import { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const modalRoot = document.getElementById('modal-root');
export default function ({ isOpen, children }) {
  const containerRef = useRef(document.createElement('div'));

  useEffect(() => {
    const container = containerRef.current;

    container.setAttribute('class', 'modal');
    modalRoot.appendChild(container);

    return () => {
      modalRoot.removeChild(container);
    };
  }, []);

  if (isOpen) {
    return ReactDOM.createPortal(children, containerRef.current);
  } else {
    return null;
  }
}
