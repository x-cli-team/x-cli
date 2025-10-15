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
  if (!isActive) return null;

  // Static snapshot: no animation to reduce render loop activity
  const staticSpinner = "⠋";
  const staticText = "Processing...";

  return (
    <Box marginTop={1}>
      <Text color="blue">
        {staticSpinner} {staticText}
      </Text>
      <Text color="gray">
        {" "}({processingTime}s · ↑ {formatTokenCount(tokenCount)} tokens · esc to interrupt)
      </Text>
    </Box>
  );
}
