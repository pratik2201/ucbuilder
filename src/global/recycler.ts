
export function moveToTrash(filePath) {
  
  (async function(filePath) {
    try {
        let trash = await import("trash");
      trash.default(filePath);
      console.log([filePath,'removed..']);
      
        console.log('File moved to trash:', filePath);
      } catch (error) {
        console.error('Error moving file to trash:', error);
      }
  })(filePath);
}
