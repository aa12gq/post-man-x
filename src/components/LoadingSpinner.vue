<template>
  <div class="spinner-container">
    <div class="spinner">
      <div class="square" v-for="n in 4" :key="n" :style="{ animationDelay: `${n * 0.2}s` }"></div>
    </div>
  </div>
</template>

<style scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.spinner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 80px;
  height: 80px;
  position: relative;
}

.square {
  width: 15px;
  height: 15px;
  background-color: #09f;
  border-radius: 4px;
  animation: bounce-rotate 1.6s infinite ease-in-out;
  box-shadow: 0 0 10px rgba(0, 153, 255, 0.5);
}

@keyframes bounce-rotate {
  0%, 100% {
    transform: translateY(0) rotate(180deg);
  }
  25% {
    transform: translateY(-15px) rotate(360deg);
  }
  50% {
    transform: translateY(0) rotate(180deg);
  }
  75% {
    transform: translateY(0px) rotate(180deg);
  }
}
</style>