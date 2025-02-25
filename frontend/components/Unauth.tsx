import Link from "next/link";

const NotAuthenticated: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0d0c0e] text-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#121114] rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Tritan Uploader</h1>
        </div>
        <p className="text-center text-gray-200">
          You need to be authenticated to view this page.
        </p>
        <div className="flex justify-center">
          <Link href="/">
            <button className="w-full rounded bg-purple-500 py-2 px-4 text-white font-bold shadow hover:bg-purple-600 transition duration-200">
              Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotAuthenticated;
