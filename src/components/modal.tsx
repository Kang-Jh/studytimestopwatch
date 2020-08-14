import { useRef, useEffect, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import '../styles/modal.css';

const modalRoot: HTMLElement = document.getElementById(
  'modalRoot'
) as HTMLElement;

export default function ({
  isOpened,
  children,
}: {
  isOpened: boolean;
  children: ReactElement;
}) {
  const containerRef = useRef(document.createElement('div'));

  useEffect(() => {
    const container: HTMLDivElement = containerRef.current;
    container.setAttribute('class', 'Modal');
    modalRoot.appendChild(container);

    return () => {
      modalRoot.removeChild(container);
    };
  }, []);

  useEffect(() => {
    if (isOpened) {
      modalRoot.setAttribute('class', 'open');
    }

    return () => {
      modalRoot.setAttribute('class', '');
    };
  }, [isOpened]);

  if (isOpened) {
    return ReactDOM.createPortal(children, containerRef.current);
  } else {
    return null;
  }
}
