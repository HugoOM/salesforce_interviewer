import type { MarkdownFrontmatter } from "../types/webserver";
import matter from "gray-matter";
import fs from "fs";

type ExercisesMetadata = { [key: string]: MarkdownFrontmatter };

function parseMarkdown(): ExercisesMetadata {
  const exercisesFolderPath = `${process.env.SRC_FOLDER}/exercises`;

  const markdownFilesName = fs.readdirSync(exercisesFolderPath);

  return markdownFilesName.reduce(
    (exercisesData: ExercisesMetadata, fileName) => {
      const fileContents = fs
        .readFileSync(`${exercisesFolderPath}/${fileName}`)
        .toString();

      const parsedContents = matter(
        fileContents
      ) as unknown as MarkdownFrontmatter;

      exercisesData[parsedContents.data.apex_class_api_name] = parsedContents;

      return exercisesData;
    },
    {}
  );
}

export { parseMarkdown };
