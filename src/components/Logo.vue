<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="1em"
    height="1em"
  >
    <path
      class="cyan"
      d=" M 4 4 L 1 4 C 0.448 4 0 4.448 0 5 L 0 8 L 4 8 L 4 4 Z "
    />
    <path
      class="cyan"
      d=" M 12 4 L 15 4 C 15.552 4 16 4.448 16 5 L 16 8 L 12 8 L 12 4 Z "
    />
    <path
      class="purple"
      d=" M 4 12 L 1 12 C 0.448 12 0 11.552 0 11 L 0 8 L 4 8 L 4 12 Z "
    />
    <path
      class="purple"
      d=" M 12 12 L 15 12 C 15.552 12 16 11.552 16 11 L 16 8 L 12 8 L 12 12 Z "
    />
    <rect
      class="inner"
      x="6"
      y="1"
      width="4"
      height="14"
      transform="matrix(1,0,0,1,0,0)"
    />
    <path
      class="outer"
      d=" M 8 0 L 8 0 C 9.656 0 11 1.344 11 3 L 11 13 C 11 14.656 9.656 16 8 16 L 8 16 C 6.344 16 5 14.656 5 13 L 5 3 C 5 1.344 6.344 0 8 0 Z  M 8 2 L 8 2 C 8.552 2 9 2.448 9 3 L 9 13 C 9 13.552 8.552 14 8 14 L 8 14 C 7.448 14 7 13.552 7 13 L 7 3 C 7 2.448 7.448 2 8 2 Z "
      fill-rule="evenodd"
    />
  </svg>
</template>

<style scoped lang="scss">
svg {
  height: 1em;
  width: 1em;
}
.cyan {
  fill: rgb(0, 165, 202);
}
.purple {
  fill: rgb(162, 54, 227);
}
.inner {
  fill: var(--color-stop-notch-inner);
}
.outer {
  fill: var(--color-stop-notch-outer);
}
</style>
