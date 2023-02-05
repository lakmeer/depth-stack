
export const load = async (src:string):Promise<HTMLCanvasElement> => {
  const image   = new Image();
  const canvas  = document.createElement("canvas");

  image.src = src;

  return new Promise((λ) => {
    image.onload = () => {
      const tempCtx = canvas.getContext("2d");
      canvas.width  = image.width;
      canvas.height = image.height;
      tempCtx.drawImage(image, 0, 0);
      λ(canvas);
    };
  });
};

