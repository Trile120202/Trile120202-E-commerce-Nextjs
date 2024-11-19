import { useCallback } from "react";
import * as fs from "fs";
import * as path from "path";

type CreateFileOptions = {
  fileName: string;
  filePath: string;
  content: string | object;
  isJson?: boolean;
};

function useCreateFile() {
  const createFile = useCallback(({ fileName, filePath, content, isJson }: CreateFileOptions) => {
    try {
      const fullPath = path.join(filePath, fileName);

      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }

      let fileContent;
      if (isJson) {
        if (typeof content === 'string') {
          try {
            const parsedContent = JSON.parse(content);
            fileContent = JSON.stringify(parsedContent, null, 2);
          } catch {
            fileContent = JSON.stringify(content, null, 2);
          }
        } else {
          fileContent = JSON.stringify(content, null, 2);
        }
      } else {
        fileContent = String(content);
      }

      fs.writeFileSync(fullPath, fileContent, "utf8");

      console.log(`File "${fullPath}" đã được tạo thành công.`);
      return { success: true, message: `File "${fullPath}" đã được tạo.` };
    } catch (error) {
      console.error("Lỗi khi tạo file:", error);
      return { success: false, message: "Lỗi khi tạo file." };
    }
  }, []);

  return { createFile };
}

export default useCreateFile;
