"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/router";

interface Metadata {
  FileType: string;
  FileSize: number;
  UploadDate: string;
  Views: number;
}

interface ImageData {
  Key: string;
  DisplayName: string;
  FileName: string;
  Metadata: Metadata;
}

interface ImagePageProps {
  params: Promise<{ slug: string }>;
}

const ImagePage = ({ params }: ImagePageProps) => {
  const { slug } = use(params);
  const [data, setData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/image/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        });
    }
  }, [slug]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#0d0c0e] text-white text-center p-5">
      <div className="container max-w-2xl w-full bg-[#121114] rounded-lg p-5 shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="loader border-t-4 border-b-4 border-purple-500 rounded-full w-16 h-16 animate-spin"></div>
          </div>
        ) : (
          <>
            {!data?.FileName ? (
              <div className="text-grey-400 mt-4 mb-4">
                The URL you requested could not be found.
              </div>
            ) : (
              <>
                <h1 className="text-2xl mb-5">{data.FileName}</h1>
                <div className="data text-sm text-gray-400 mt-1 mb-5">
                  <div>{data.Metadata.UploadDate}</div>
                  <div>Uploaded by {data.DisplayName}</div>
                  <div>{data.Metadata.Views} Views</div>
                  <div>{data.Metadata.FileSize} bytes</div>
                </div>
                <a
                  href={`https://s3.tritan.gg/images/${data.FileName}`}
                  target="_blank"
                >
                  <img
                    src={`https://s3.tritan.gg/images/${data.FileName}`}
                    alt="Cannot preview this file in the browser, click here to open."
                    className="max-h-[75vh] w-auto max-w-full rounded-lg mb-5"
                  />
                </a>
                <br />
                <a
                  className="report-link text-purple-500 mt-5 inline-block px-5 py-2 border border-purple-500 rounded transition-colors duration-300 bg-purple-500 text-white"
                  href={`mailto:noc@tritan.gg?subject=REPORT: ${data.FileName}&body=Hi, I'd like to report ${data.FileName} which was uploaded onto your sharex image host.`}
                >
                  Report
                </a>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImagePage;
