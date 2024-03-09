<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    role="img"
  >
    <path
      style="
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-linecap: round;
      "
      d="M 4,4 A 16,16 0 0 1 20,20"
      class="outer"
    />
    <path
      style="
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-linecap: round;
      "
      d="M 4,12 A 8,8 0 0 1 12,20"
      class="inner"
    />
  </svg>
</template>

<style scoped lang="scss">
.outer {
  animation: pulse 2s linear 0.25s infinite;
  stroke-opacity: 0%;
}
.inner {
  animation: pulse 2s linear 0s infinite;
  stroke-opacity: 0%;
}

@keyframes pulse {
  0% {
    stroke-opacity: 0%;
  }
  20% {
    stroke-opacity: 100%;
  }
  40% {
    stroke-opacity: 0%;
  }
  100% {
    stroke-opacity: 0%;
  }
}
</style>
