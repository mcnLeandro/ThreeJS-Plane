const Config = {
  size: {
    width: {
      default: 50,
      min: 1,
      max: 100,
    },
    height: {
      default: 50,
      min: 1,
      max: 100,
    },
    segments: {
      default: 10,
      min: 1,
      max: 50,
    },
  },
  color: {
    default: {
      r: 0,
      g: 0.19,
      b: 0.4,
    },
    hover: {
      r: 0.1,
      g: 0.5,
      b: 1,
    },
  },
};


export default Config;