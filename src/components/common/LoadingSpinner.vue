<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    role="img"
  >
    <title>Loading spinner</title>
    <circle cx="8" cy="8" r="2" fill="currentColor"></circle>
    <circle cx="16" cy="8" r="2" fill="currentColor"></circle>
    <circle cx="16" cy="16" r="2" fill="currentColor"></circle>
    <circle cx="8" cy="16" r="2" fill="currentColor"></circle>
  </svg>
</template>

<style scoped lang="scss">
svg {
  animation: flip 1s ease-out 0s infinite;
  width: 1em;
  height: 1em;
  color: var(--color-ink-30);
  font-size: 2rem;
}
circle:nth-child(2) {
  animation: pulse 1s linear 0s infinite;
  transform-origin: 33% 33%;
}
circle:nth-child(3) {
  animation: pulse 1s linear 0.1s infinite;
  transform-origin: 67% 33%;
}
circle:nth-child(4) {
  animation: pulse 1s linear 0.2s infinite;
  transform-origin: 67% 67%;
}
circle:nth-child(5) {
  animation: pulse 1s linear 0.3s infinite;
  transform-origin: 33% 67%;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  10% {
    transform: scale(2);
  }
  30% {
    transform: scale(1);
  }
}

@keyframes flip {
  0% {
    transform: rotate(0deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(180deg);
  }
}
</style>
