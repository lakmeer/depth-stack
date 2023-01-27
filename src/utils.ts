
export const load = async (src:string):Promise<HTMLCanvasElement> => {
  const image   = new Image();
  const canvas  = document.createElement("canvas");
  const tempCtx = canvas.getContext("2d");
  canvas.width  = 512;
  canvas.height = 512;

  image.src = src;

  return new Promise((λ) => {
    image.onload = () => {
      tempCtx.drawImage(image, 0, 0);
      λ(canvas);
    };
  });
};

