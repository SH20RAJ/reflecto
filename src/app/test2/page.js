import { Editor } from "novel-lightweight";

export default function App() {
  const [data, setData] = useState("");

  return (
    <Editor
      defaultValue={data}
      disableLocalStorage={true}
      onUpdate={(editor) => {
        setData(editor?.storage.markdown.getMarkdown());
      }}
      handleImageUpload={async (file) => {
        const uploads = await startUpload([file]);
        if (uploads && uploads.length > 0) {
          return uploads[0].url;
        }
        return "www.example.com/failed-upload.png";
      }}
    />
  );
}