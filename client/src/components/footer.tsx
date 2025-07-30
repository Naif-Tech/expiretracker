import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-4 text-gray-500 text-sm border-t mt-8">
      <span>
        &copy; {new Date().getFullYear()} نايف العتيبي. جميع الحقوق محفوظة. | تواصل: every.good@hotmail.com
      </span>
    </footer>
  );
};

export default Footer;
