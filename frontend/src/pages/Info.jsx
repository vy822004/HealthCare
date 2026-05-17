import { useParams } from "react-router-dom";

const Info = () => {
  const { type } = useParams();

  return (
    <div className="text-white p-6">

      {type === "reports" && <div>📄 Medical Reports Content</div>}
      {type === "exercise" && <div>💪 Exercise History Content</div>}
      {type === "current" && <div>🩺 Current Conditions Content</div>}
      {type === "personal" && <div>📄 Personal Information Content</div>}
    </div>
  );
};

export default Info;