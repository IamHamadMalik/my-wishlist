import tailwindcss from "@tailwindcss/postcss";

css: {
  postcss: {
    plugins: [
      tailwindcss(),
      autoprefixer(),
    ],
  },
},
