export type CompileAndTestResults = {
  compileResults: {
    success: boolean;
    errors?: {
      line: number;
      message: string;
    }[];
  };
  testResults?: {
    success: boolean;
    tests: {
      status: string;
      name: string;
      message: string;
    }[];
  };
};

export enum ChallengeLevel {
  JUNIOR,
  INTERMEDIATE,
  SENIOR,
}

export type MarkdownFrontmatter = {
  content: string;
  data: {
    exercise_directory: string;
    apex_class_api_name: string;
    version: number;
    level: ChallengeLevel;
    tests: string[];
  };
};
