import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';

interface Experience {
  id: number;
  company: string;
  role: string;
  duration: string;
  desc: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  year: string;
}

interface Project {
  id: number;
  title: string;
  link: string;
  desc: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
  photo: string | null;
  summary: string;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  languages: string;
  skills: string;
}

type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'creative' | 'professional' | 'ats' | 'modern-sidebar';

interface ResumePreviewDataProps {
  template: ResumeTemplate;
  data: ResumeData;
}

export function ResumePreviewData({ template, data }: ResumePreviewDataProps) {
  const getSkills = () => data.skills.split(',').map(s => s.trim()).filter(s => s !== '');

  const ContactInfo = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-wrap gap-4 text-[10px] sm:text-xs font-medium ${className}`}>
      {data.email && <span className="flex items-center gap-1"><Mail size={12} /> {data.email}</span>}
      {data.phone && <span className="flex items-center gap-1"><Phone size={12} /> {data.phone}</span>}
      {data.address && <span className="flex items-center gap-1"><MapPin size={12} /> {data.address}</span>}
      {data.linkedin && <span className="flex items-center gap-1"><Linkedin size={12} /> {data.linkedin}</span>}
    </div>
  );

  switch (template) {
    case 'modern':
      return (
        <div className="h-full p-[40px] flex flex-col pt-0">
          <header className="border-b-4 border-slate-900 pb-6 mb-8 mt-0 pt-0">
            <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">{data.name}</h1>
            <h2 className="text-xl font-bold text-primary mb-4">{data.title}</h2>
            <ContactInfo className="text-slate-600" />
          </header>

          <section className="mb-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-[2px] bg-primary"></div> Professional Summary
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">{data.summary}</p>
          </section>

          <div className="grid grid-cols-3 gap-10">
            <div className="col-span-2 space-y-8">
              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-100 pb-1">Experience</h3>
                {data.experience.map(exp => (
                  <div key={exp.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{exp.role}</h4>
                      <span className="text-[10px] font-bold text-primary uppercase whitespace-nowrap">{exp.duration}</span>
                    </div>
                    <p className="text-xs font-black text-slate-500 mb-2">{exp.company}</p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{exp.desc}</p>
                  </div>
                ))}
              </section>

              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-100 pb-1">Academic History</h3>
                {data.education.map(edu => (
                  <div key={edu.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{edu.year}</span>
                    </div>
                    <p className="text-xs text-slate-600">{edu.school}</p>
                  </div>
                ))}
              </section>

              {data.certifications.length > 0 && (
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4 border-b-2 border-slate-100 pb-1">Certifications</h3>
                  {data.certifications.map(cert => (
                    <div key={cert.id} className="mb-2">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="text-xs font-bold text-slate-900">{cert.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{cert.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{cert.issuer}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {getSkills().map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">{skill}</span>
                  ))}
                </div>
              </section>

              {data.projects.length > 0 && (
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Case Studies</h3>
                  {data.projects.map(proj => (
                    <div key={proj.id} className="mb-4">
                      <h4 className="text-[11px] font-black text-slate-900 mb-1">{proj.title}</h4>
                      <p className="text-[10px] text-slate-600 leading-tight">{proj.desc}</p>
                    </div>
                  ))}
                </section>
              )}

              {data.languages && (
                <section>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-4">Languages</h3>
                  <p className="text-[11px] font-medium text-slate-600 italic">{data.languages}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      );

    case 'modern-sidebar':
      return (
        <div className="flex h-full w-full overflow-hidden">
          <aside className="w-1/3 bg-slate-900 text-white p-10 pt-10 flex flex-col gap-8 h-full">
            {data.photo && (
              <div className="w-full aspect-square rounded-3xl overflow-hidden border-4 border-white/10 mt-0">
                <img src={data.photo} className="w-full h-full object-cover" alt="Profile" />
              </div>
            )}
            
            <section className="mt-0 pt-0">
              <h3 className="text-xs font-black uppercase tracking-[3px] text-primary mb-6 mt-0">Contact</h3>
              <div className="space-y-4 text-[10px]">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-primary" />
                  <span className="break-all">{data.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-primary" />
                  <span>{data.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-primary" />
                  <span>{data.address}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black uppercase tracking-[3px] text-primary mb-6">Skills</h3>
              <div className="space-y-2">
                {getSkills().map((skill, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-medium">{skill}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(dot => (
                        <div key={dot} className={`w-1 h-1 rounded-full ${dot <= 4 ? 'bg-primary' : 'bg-white/20'}`}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {data.certifications.length > 0 && (
              <section>
                <h3 className="text-xs font-black uppercase tracking-[3px] text-primary mb-6">Certs</h3>
                <div className="space-y-3">
                  {data.certifications.map(cert => (
                    <div key={cert.id}>
                      <p className="text-[10px] font-bold">{cert.name}</p>
                      <p className="text-[8px] opacity-60 uppercase">{cert.issuer}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>

          <main className="flex-1 p-12 pt-12 space-y-10 h-full">
            <header className="mt-0 pt-0">
              <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 mb-2 mt-0">{data.name}</h1>
              <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">{data.title}</h2>
            </header>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[5px] text-slate-300 mb-4">Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{data.summary}</p>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[5px] text-slate-300 mb-6">Experience</h3>
              <div className="space-y-8">
                {data.experience.map(exp => (
                  <div key={exp.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary before:rounded-full">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-black text-slate-900 text-sm">{exp.role}</h4>
                      <span className="text-[10px] font-bold text-slate-400 italic">{exp.duration}</span>
                    </div>
                    <p className="text-[10px] font-bold text-primary mb-2">{exp.company}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {data.projects.length > 0 && (
              <section>
                <h3 className="text-sm font-black uppercase tracking-[5px] text-slate-300 mb-6">Featured Projects</h3>
                <div className="grid grid-cols-2 gap-6">
                  {data.projects.map(proj => (
                    <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="text-[11px] font-black text-slate-900 mb-1">{proj.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      );

    case 'minimal':
      return (
        <div className="w-full h-full p-[40px] pt-0">
          <header className="mb-12 pt-0 mt-0">
            <h1 className="text-5xl font-light text-slate-900 mb-4 tracking-tight">{data.name}</h1>
            <p className="text-xl text-slate-400 mb-8">{data.title}</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              {data.email} • {data.phone} • {data.address}
            </div>
          </header>

          <div className="space-y-16">
            <section className="grid grid-cols-4 gap-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 pt-1">About</h3>
              <div className="col-span-3">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{data.summary}</p>
              </div>
            </section>

            <section className="grid grid-cols-4 gap-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 pt-1">History</h3>
              <div className="col-span-3 space-y-10">
                {data.experience.map(exp => (
                  <div key={exp.id}>
                    <h4 className="text-sm font-black text-slate-900">{exp.role} <span className="text-slate-300 mx-2">/</span> <span className="text-slate-400">{exp.company}</span></h4>
                    <p className="text-[10px] font-bold text-slate-300 mb-4">{exp.duration}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{exp.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {data.certifications.length > 0 && (
              <section className="grid grid-cols-4 gap-10">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 pt-1">Awards</h3>
                <div className="col-span-3 space-y-4">
                  {data.certifications.map(cert => (
                    <p key={cert.id} className="text-xs font-bold text-slate-700">{cert.name} / <span className="text-slate-400">{cert.issuer}</span></p>
                  ))}
                </div>
              </section>
            )}

            <section className="grid grid-cols-4 gap-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 pt-1">Stack</h3>
              <div className="col-span-3 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-800">
                {getSkills().map((s, i) => <span key={i}>{s}</span>)}
              </div>
            </section>
          </div>
        </div>
      );

    case 'ats':
      return (
        <div className="w-full h-full p-[40px] pt-0 font-serif overflow-hidden">
          <div className="text-center border-b-2 border-black pb-4 mb-4 mt-0 pt-0">
            <h1 className="text-3xl font-bold text-black mb-1">{data.name}</h1>
            <p className="text-xs text-black">
              {data.address} | {data.phone} | {data.email} | {data.linkedin}
            </p>
          </div>

          <section>
            <h3 className="text-sm font-bold border-b border-black uppercase mb-2">Summary</h3>
            <p className="text-xs leading-relaxed text-black">{data.summary}</p>
          </section>

          <section>
            <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Professional Experience</h3>
            {data.experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between font-bold text-xs">
                  <span>{exp.company}</span>
                  <span>{exp.duration}</span>
                </div>
                <div className="flex justify-between italic text-xs mb-1">
                  <span>{exp.role}</span>
                  <span>{data.address.split(',').pop()?.trim()}</span>
                </div>
                <p className="text-xs text-black whitespace-pre-line leading-snug">{exp.desc}</p>
              </div>
            ))}
          </section>

          {data.projects.length > 0 && (
            <section>
              <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Key Projects</h3>
              {data.projects.map(proj => (
                <div key={proj.id} className="mb-2">
                  <p className="text-xs text-black"><span className="font-bold">{proj.title}:</span> {proj.desc}</p>
                </div>
              ))}
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Education</h3>
            {data.education.map(edu => (
              <div key={edu.id} className="mb-2">
                <div className="flex justify-between font-bold text-xs">
                  <span>{edu.school}</span>
                  <span>{edu.year}</span>
                </div>
                <div className="text-xs italic">{edu.degree}</div>
              </div>
            ))}
          </section>

          {data.certifications.length > 0 && (
            <section>
              <h3 className="text-sm font-bold border-b border-black uppercase mb-3">Certifications</h3>
              <ul className="list-disc pl-5 text-xs text-black">
                {data.certifications.map(cert => (
                  <li key={cert.id}>{cert.name} - {cert.issuer} ({cert.date})</li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold border-b border-black uppercase mb-2">Skills & Others</h3>
            <p className="text-xs text-black">
              <span className="font-bold">Technical Skills:</span> {data.skills}
            </p>
            {data.languages && (
              <p className="text-xs text-black mt-1">
                <span className="font-bold">Languages:</span> {data.languages}
              </p>
            )}
          </section>
        </div>
      );

    case 'creative':
      return (
        <div className="flex flex-col h-full w-full overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-primary text-white p-12 pt-16 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10">
                <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">{data.name}</h1>
                <p className="text-2xl font-medium opacity-80 mb-8">{data.title}</p>
                <div className="flex flex-wrap gap-6 text-sm font-bold">
                    <span className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-2">
                        <Mail size={16} /> {data.email}
                    </span>
                    <span className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md flex items-center gap-2">
                        <Phone size={16} /> {data.phone}
                    </span>
                </div>
             </div>
          </div>

          <div className="flex-1 p-[20mm] grid grid-cols-12 gap-12">
            <div className="col-span-8 space-y-12">
                <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
                        Experience <div className="h-[2px] flex-1 bg-slate-100"></div>
                    </h3>
                    <div className="space-y-10">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="text-lg font-black text-slate-800">{exp.role}</h4>
                                    <span className="px-3 py-1 bg-slate-50 text-[10px] font-black uppercase text-primary border border-slate-100 rounded-full">{exp.duration}</span>
                                </div>
                                <p className="text-sm font-bold text-indigo-600 mb-3">{exp.company}</p>
                                <p className="text-sm text-slate-500 leading-relaxed">{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {data.projects.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4">
                        Projects <div className="h-[2px] flex-1 bg-slate-100"></div>
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        {data.projects.map(proj => (
                            <div key={proj.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h4 className="text-sm font-black text-slate-800 mb-2">{proj.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{proj.desc}</p>
                            </div>
                        ))}
                    </div>
                  </section>
                )}
            </div>

            <div className="col-span-4 space-y-12">
                <section>
                    <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                        {getSkills().map((s, i) => (
                            <span key={i} className="px-4 py-2 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase hover:border-primary hover:text-primary transition-all">
                                {s}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Education</h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-6">
                            <h4 className="text-sm font-black text-slate-800 mb-1">{edu.degree}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mb-1">{edu.school}</p>
                            <p className="text-[10px] font-black text-primary">{edu.year}</p>
                        </div>
                    ))}
                </section>

                {data.certifications.length > 0 && (
                  <section>
                    <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Certs</h3>
                    {data.certifications.map(cert => (
                      <div key={cert.id} className="mb-4">
                        <p className="text-xs font-black text-slate-800">{cert.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 italic">{cert.issuer}</p>
                      </div>
                    ))}
                  </section>
                )}
            </div>
          </div>
        </div>
      );

    case 'professional':
      return (
        <div className="w-full h-full p-[40px] pt-0">
          <div className="flex items-start justify-between border-b-8 border-slate-900 pb-8 mt-0 pt-0">
            <div>
                <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">{data.name}</h1>
                <p className="text-xl font-bold text-slate-500 uppercase tracking-widest">{data.title}</p>
            </div>
            {data.photo && (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-900 grayscale">
                    <img src={data.photo} className="w-full h-full object-cover" alt="Profile" />
                </div>
            )}
          </div>

          <div className="grid grid-cols-12 gap-12">
            <div className="col-span-4 space-y-10">
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 inline-block mb-4">Contact</h3>
                    <div className="space-y-4 text-xs font-bold text-slate-600">
                        <p className="flex items-center gap-2"><Mail size={14} /> {data.email}</p>
                        <p className="flex items-center gap-2"><Phone size={14} /> {data.phone}</p>
                        <p className="flex items-center gap-2"><MapPin size={14} /> {data.address}</p>
                        <p className="flex items-center gap-2"><Linkedin size={14} /> LinkedIn</p>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 inline-block mb-4">Core Skills</h3>
                    <div className="space-y-2">
                        {getSkills().map((s, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-slate-900 rotate-45"></div>
                                <span className="text-xs font-bold text-slate-700">{s}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 inline-block mb-4">Education</h3>
                    {data.education.map(edu => (
                        <div key={edu.id} className="mb-4">
                            <p className="text-xs font-black text-slate-900">{edu.degree}</p>
                            <p className="text-[10px] font-bold text-slate-500">{edu.school}</p>
                            <p className="text-[10px] font-medium text-slate-400">{edu.year}</p>
                        </div>
                    ))}
                </section>

                {data.certifications.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 inline-block mb-4">Certs</h3>
                    {data.certifications.map(cert => (
                      <div key={cert.id} className="mb-4">
                        <p className="text-xs font-black text-slate-900">{cert.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 italic">{cert.issuer}</p>
                      </div>
                    ))}
                  </section>
                )}
            </div>

            <div className="col-span-8 space-y-10">
                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1 mb-4">Professional Overview</h3>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{data.summary}</p>
                </section>

                <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1 mb-6">Experience Record</h3>
                    <div className="space-y-8">
                        {data.experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-sm font-black text-slate-900 uppercase">{exp.role}</h4>
                                    <span className="text-[10px] font-black text-slate-400">{exp.duration}</span>
                                </div>
                                <p className="text-xs font-black text-slate-500 mb-3">{exp.company}</p>
                                <p className="text-xs text-slate-600 leading-relaxed">{exp.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {data.projects.length > 0 && (
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1 mb-6">Projects</h3>
                    <div className="space-y-6">
                        {data.projects.map(proj => (
                            <div key={proj.id}>
                                <h4 className="text-xs font-black text-slate-900 mb-1">{proj.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed italic">{proj.desc}</p>
                            </div>
                        ))}
                    </div>
                  </section>
                )}
            </div>
          </div>
        </div>
      );

    case 'classic':
    default:
      return (
        <div className="w-full h-full p-[40px] pt-0 text-center font-serif text-slate-900 overflow-hidden">
          <header className="border-b-2 border-slate-900 pb-4 mb-6 mt-0 pt-0">
            <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{data.name}</h1>
            <p className="text-sm font-medium">
              {data.address} • {data.phone} • {data.email}
            </p>
          </header>

          <main className="text-left space-y-8">
            <section>
              <h3 className="text-sm font-bold border-b border-slate-300 mb-2 uppercase italic tracking-widest">Objective</h3>
              <p className="text-xs leading-relaxed text-slate-800">{data.summary}</p>
            </section>

            <section>
              <h3 className="text-sm font-bold border-b border-slate-300 mb-4 uppercase italic tracking-widest">Experience</h3>
              {data.experience.map(exp => (
                <div key={exp.id} className="mb-6">
                  <div className="flex justify-between items-baseline font-bold text-sm">
                    <span>{exp.company}</span>
                    <span className="text-xs italic">{exp.duration}</span>
                  </div>
                  <p className="text-xs italic font-semibold mb-2">{exp.role}</p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.desc}</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-sm font-bold border-b border-slate-300 mb-3 uppercase italic tracking-widest">Academic Credentials</h3>
              {data.education.map(edu => (
                <div key={edu.id} className="mb-3">
                  <div className="flex justify-between items-baseline font-bold text-xs">
                    <span>{edu.school}</span>
                    <span className="text-[10px] italic">{edu.year}</span>
                  </div>
                  <p className="text-xs">{edu.degree}</p>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-sm font-bold border-b border-slate-300 mb-2 uppercase italic tracking-widest">Core Proficiencies</h3>
              <p className="text-xs text-slate-800 leading-loose">{data.skills}</p>
            </section>
          </main>
        </div>
      );
  }
}
