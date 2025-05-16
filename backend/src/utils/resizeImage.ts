import path from "path";
import sharp, { ResizeOptions } from "sharp";

interface ResizeImageOptions {
  width: number;
  height: number;
  fit?: keyof sharp.FitEnum;
  background?: sharp.Color;
}

export class ImageResizer {
  /**
   * Resizes an image to specified dimensions without cropping
   * @param inputPath Path to source image
   * @param outputPath Destination path (defaults to same directory with '_resized' suffix)
   * @param options Resize configuration
   * @returns Output file path
   */
  static async resize(
    inputPath: string,
    outputPath?: string,
    options: Partial<ResizeImageOptions> = {}
  ): Promise<string> {
    const defaultOptions: ResizeImageOptions = {
      width: 96,
      height: 96,
      fit: "inside",
      background: { r: 255, g: 255, b: 255, alpha: 0 }, // Transparent background
    };

    const mergedOptions = { ...defaultOptions, ...options };
    const output = outputPath || this.getDefaultOutputPath(inputPath);

    await sharp(inputPath)
      .resize(mergedOptions as ResizeOptions)
      .toFile(output);

    return output;
  }

  private static getDefaultOutputPath(inputPath: string): string {
    const parsed = path.parse(inputPath);
    return path.join(parsed.dir, `${parsed.name}_resized${parsed.ext}`);
  }

  /**
   * Resizes multiple images to 96x96
   * @param filePaths Array of image paths
   * @param outputDir Optional output directory
   */
  static async batchResize(
    filePaths: string[],
    outputDir?: string
  ): Promise<string[]> {
    const results: string[] = [];

    for (const filePath of filePaths) {
      const outputPath = outputDir
        ? path.join(outputDir, path.basename(filePath))
        : undefined;

      results.push(await this.resize(filePath, outputPath));
    }

    return results;
  }
}
