<template>
  <span>{{ this.label }}</span>
</template>
<script>
export default {
  name: "basic-content",
  props: {
    label: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped></style>
