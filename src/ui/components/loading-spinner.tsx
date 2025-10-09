import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { formatTokenCount } from "../../utils/token-counter.js";

interface LoadingSpinnerProps {
  isActive: boolean;
  processingTime: number;
  tokenCount: number;
}

const loadingTexts = [
  "Thinking...",
  "Processing...",
  "Analyzing...",
  "Working...",
  "Computing...",
  "Generating...",
  "Herding electrons...",
  "Combobulating...",
  "Discombobulating...",
  "Recombobulating...",
  "Calibrating flux capacitors...",
  "Reticulating splines...",
  "Adjusting bell curves...",
  "Optimizing bit patterns...",
  "Harmonizing frequencies...",
  "Synchronizing timelines...",
  "Defragmenting thoughts...",
  "Compiling wisdom...",
  "Bootstrapping reality...",
  "Untangling quantum states...",
  "Negotiating with servers...",
  "Convincing pixels to cooperate...",
  "Summoning digital spirits...",
  "Caffeinating algorithms...",
  "Debugging the universe...",
];

export function LoadingSpinner({
  isActive,
  processingTime,
  tokenCount,
}: LoadingSpinnerProps) {
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    // Smooth animation with faster transitions like Claude Code
    const interval = setInterval(() => {
      setSpinnerFrame((prev) => (prev + 1) % spinnerFrames.length);
    }, 80);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    setLoadingTextIndex(Math.floor(Math.random() * loadingTexts.length));

    // Increased interval: 4s instead of 2s to reduce state changes
    const interval = setInterval(() => {
      setLoadingTextIndex(Math.floor(Math.random() * loadingTexts.length));
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  return (
    <Box marginTop={1}>
      <Text color="blue">
        {spinnerFrames[spinnerFrame]} {loadingTexts[loadingTextIndex]}
      </Text>
      <Text color="gray">
        {" "}({processingTime}s · ↑ {formatTokenCount(tokenCount)} tokens · esc to interrupt)
      </Text>
    </Box>
  );
}
