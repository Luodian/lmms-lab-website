import { useState, useEffect, useCallback } from "react";

type KeyState = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
};

const INITIAL_KEY_STATE: KeyState = {
  up: false,
  down: false,
  left: false,
  right: false,
  interact: false,
};

const KEY_MAPPINGS: Record<string, keyof KeyState> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyE: "interact",
  Space: "interact",
};

export function useKeyboard() {
  const [keys, setKeys] = useState<KeyState>(INITIAL_KEY_STATE);
  const [interactPressed, setInteractPressed] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const action = KEY_MAPPINGS[e.code];
    if (action) {
      e.preventDefault();
      setKeys((prev) => ({ ...prev, [action]: true }));
      if (action === "interact") {
        setInteractPressed(true);
      }
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const action = KEY_MAPPINGS[e.code];
    if (action) {
      e.preventDefault();
      setKeys((prev) => ({ ...prev, [action]: false }));
    }
  }, []);

  const consumeInteract = useCallback(() => {
    setInteractPressed(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { keys, interactPressed, consumeInteract };
}
