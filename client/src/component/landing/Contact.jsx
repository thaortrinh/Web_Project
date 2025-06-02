import React from "react";
import { Mail, Phone, MapPin, Clock, Globe } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: <Phone className="text-[#C271AB]" size={24} />,
      title: "PHONE",
      content: "+84 28 3724 4270",
      description: "Vietnam National University",
    },
    {
      icon: <Mail className="text-[#5784C7]" size={24} />,
      title: "EMAIL",
      content: "info@vnu.edu.vn",
      description: "International University",
    },
    {
      icon: <MapPin className="text-[#9C5088]" size={24} />,
      title: "ADDRESS",
      content: "Quarter 6, Thu Duc City",
      description: "Ho Chi Minh City, Vietnam",
    },
  ];

  const teamEmails = [
    {
      name: "Thao Trinh",
      role: "UI/UX Designer & Frontend Developer",
      email: "ITCSIU22288@student.hcmiu.edu.vn",
    },
    {
      name: "Quynh Nhu",
      role: "Project Manager & Backend Developer",
      email: "ITCSIU22202@student.hcmiu.edu.vn",
    },
    {
      name: "Boi Ngoc",
      role: "Business Analyst & Frontend Developer",
      email: "ITCSIU22312@student.hcmiu.edu.vn",
    },
  ];

  return (
    <section id="contact" className="!py-14 !px-8 bg-white">
      <div className="container !mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center !mb-16">
          <h2 className="text-4xl font-bold !mb-4">
            <span className="text-gray-900">Get in </span>
            <span className="bg-gradient-to-r from-[#C271AB] to-[#5784C7] text-transparent bg-clip-text">
              Touch
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl !mx-auto text-lg">
            Have questions about TaskUP? We'd love to hear from you. Reach out
            to us through any of the contact methods below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div>
            <div className="!mb-12">
              <h3 className="text-2xl font-bold text-gray-800 !mb-6">
                Contact Information
              </h3>
              <p className="text-gray-600 !mb-8">
                We're here to help and answer any question you might have about
                TaskUP.
              </p>

              {/* Contact Details */}
              <div className="!space-y-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm tracking-wide !mb-2">
                        {info.title}
                      </h4>
                      <p className="text-gray-900 font-medium !mb-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-gray-500">
                        {info.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Contact */}
            <div className="bg-gray-50 rounded-2xl !p-6">
              <h4 className="font-bold text-gray-800 !mb-6 text-lg">
                Team Members
              </h4>
              <div className="!space-y-4">
                {teamEmails.map((member, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg !p-4 shadow-sm"
                  >
                    <h5 className="font-semibold text-gray-800 !mb-1">
                      {member.name}
                    </h5>
                    <p className="text-sm text-gray-600 !mb-2">{member.role}</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-[#C271AB] hover:text-[#9C5088] text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                    >
                      <Mail size={16} />
                      {member.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
              <div className="!p-6 bg-white">
                <h3 className="text-xl font-bold text-gray-800 !mb-2">
                  Visit Our University
                </h3>
                <p className="text-gray-600 !mb-4">
                  International University - Vietnam National University HCMC
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={16} />
                  <span>Quarter 6, Thu Duc City, Ho Chi Minh City</span>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="relative w-full h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d966.9529984577!2d106.8004154!3d10.8773138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a415a9d221%3A0x550c2b41569376f9!2sTr%C6%B0%E1%BB%9Dng%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20Qu%E1%BB%91c%20T%E1%BA%BF%20-%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20Qu%E1%BB%91c%20gia%20TP.HCM!5e0!3m2!1sen!2s!4v1621234567890!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="International University Location"
                ></iframe>
              </div>

              {/* Map Footer */}
              <div className="!p-4 bg-white border-t">
                <a
                  href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Qu%E1%BB%91c+T%E1%BA%BF+-+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Qu%E1%BB%91c+gia+TP.HCM/@10.8773138,106.8004154,385m/data=!3m1!1e3!4m19!1m12!4m11!1m3!2m2!1d106.801689!2d10.8779959!1m6!1m2!1s0x3174d8a415a9d221:0x550c2b41569376f9!2za2h1IHBo4buRIDYsIFRQIFRo4bunIMSQ4bupYywgSOG7kyBDaMOtIE1pbmg!2m2!1d106.8016196!2d10.8775848!3m5!1s0x3174d8a415a9d221:0x550c2b41569376f9!8m2!3d10.8775848!4d106.8016196!16s%2Fm%2F02qq622?entry=ttu&g_ep=EgoyMDI1MDUxNS4xIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-[#C271AB] to-[#5784C7] text-white !py-3 !px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 text-sm"
                >
                  <MapPin size={18} />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* University Info */}
        <div className="!mt-16">
          <div className="bg-gradient-to-r from-[#C271AB] to-[#5784C7] rounded-2xl !p-8 text-white text-center">
            <h3 className="text-2xl font-bold !mb-4">
              International University - VNU HCMC
            </h3>
            <p className="text-white/90 text-sm w-full max-w-[90%] md:max-w-[80%] lg:max-w-[75%] !mx-auto !mb-6">
              We are students at the International University, part of Vietnam
              National University Ho Chi Minh City. <br /> TaskUP is our capstone
              project, designed to revolutionize task management and team
              collaboration.
            </p>
            <div className="flex flex-wrap justify-center gap-8 !mt-8">
              <div className="flex items-center gap-2">
                <Globe size={20} />
                <span>hcmiu.edu.vn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={20} />
                <span>+84 28 3724 4270</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={20} />
                <span>Thu Duc City, HCMC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
