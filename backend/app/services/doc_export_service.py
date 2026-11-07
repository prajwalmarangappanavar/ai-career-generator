import io
import json
from typing import Any, Dict
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
import docx
from docx.shared import Inches, Pt, RGBColor

class DocExportService:
    """Exports Resumes, Cover Letters, Skill Gap Reports, and Roadmaps to PDF and DOCX."""

    @staticmethod
    def generate_resume_pdf(resume_data: Dict[str, Any]) -> bytes:
        """Generate a clean, modern, ATS-friendly PDF resume using ReportLab."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ResumeTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#1E293B')
        )
        subtitle_style = ParagraphStyle(
            'ResumeSub',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B')
        )
        section_heading = ParagraphStyle(
            'SectionHead',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#0F172A'),
            spaceBefore=10,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            'ResumeBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        bullet_style = ParagraphStyle(
            'ResumeBullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            leftIndent=14,
            textColor=colors.HexColor('#334155')
        )

        elements = []

        # Header
        personal = resume_data.get("personal_info", {})
        elements.append(Paragraph(personal.get("full_name", "Student Name"), title_style))
        contact_line = f"{personal.get('headline', '')} | {personal.get('email', '')} | {personal.get('phone', '')} | {personal.get('location', '')}"
        elements.append(Paragraph(contact_line, subtitle_style))
        elements.append(Spacer(1, 6))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceBefore=2, spaceAfter=8))

        # Professional Summary
        summary = resume_data.get("summary", "")
        if summary:
            elements.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
            elements.append(Paragraph(summary, body_style))
            elements.append(Spacer(1, 6))

        # Skills
        tech_skills = resume_data.get("technical_skills", [])
        soft_skills = resume_data.get("soft_skills", [])
        if tech_skills or soft_skills:
            elements.append(Paragraph("TECHNICAL & PROFESSIONAL SKILLS", section_heading))
            if tech_skills:
                elements.append(Paragraph(f"<b>Technical Stack:</b> {', '.join(tech_skills)}", body_style))
            if soft_skills:
                elements.append(Paragraph(f"<b>Core Competencies:</b> {', '.join(soft_skills)}", body_style))
            elements.append(Spacer(1, 6))

        # Experience / Internships
        internships = resume_data.get("internships", [])
        if internships:
            elements.append(Paragraph("PRACTICAL EXPERIENCE & INTERNSHIPS", section_heading))
            for item in internships:
                elements.append(Paragraph(f"<b>{item.get('position')}</b> - {item.get('company')} <font color='#64748B'>({item.get('duration')})</font>", body_style))
                for b in item.get("bullets", []):
                    elements.append(Paragraph(f"• {b}", bullet_style))
                elements.append(Spacer(1, 4))
            elements.append(Spacer(1, 4))

        # Projects
        projects = resume_data.get("projects", [])
        if projects:
            elements.append(Paragraph("TECHNICAL PROJECTS", section_heading))
            for p in projects:
                tech_label = f" <font color='#64748B'>[{p.get('technologies')}]</font>" if p.get('technologies') else ""
                elements.append(Paragraph(f"<b>{p.get('title')}</b> - {p.get('role')}{tech_label}", body_style))
                for b in p.get("bullets", []):
                    elements.append(Paragraph(f"• {b}", bullet_style))
                elements.append(Spacer(1, 4))
            elements.append(Spacer(1, 4))

        # Education
        education = resume_data.get("education", [])
        if education:
            elements.append(Paragraph("EDUCATION", section_heading))
            for e in education:
                cgpa_str = f" | CGPA: {e.get('cgpa')}" if e.get('cgpa') else ""
                elements.append(Paragraph(f"<b>{e.get('degree')} in {e.get('department')}</b> - {e.get('institution')} ({e.get('graduation_year')}){cgpa_str}", body_style))
                if e.get("relevant_courses"):
                    elements.append(Paragraph(f"<font color='#64748B'>Relevant Coursework: {e.get('relevant_courses')}</font>", bullet_style))
                elements.append(Spacer(1, 4))

        # Certifications
        certs = resume_data.get("certifications", [])
        if certs:
            elements.append(Paragraph("CERTIFICATIONS", section_heading))
            for c in certs:
                elements.append(Paragraph(f"• <b>{c.get('name')}</b> - {c.get('issuing_org')} ({c.get('issue_date')})", bullet_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_resume_docx(resume_data: Dict[str, Any]) -> bytes:
        """Generate a clean DOCX resume using python-docx."""
        doc = docx.Document()

        # Set standard margins (0.5 inch)
        for section in doc.sections:
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.6)
            section.right_margin = Inches(0.6)

        personal = resume_data.get("personal_info", {})

        # Name
        h1 = doc.add_heading(personal.get("full_name", "Student Name"), level=0)
        h1.runs[0].font.size = Pt(20)
        h1.runs[0].font.color.rgb = RGBColor(30, 41, 59)

        # Contact subtitle
        sub = doc.add_paragraph(f"{personal.get('headline', '')} | {personal.get('email', '')} | {personal.get('phone', '')} | {personal.get('location', '')}")
        sub.runs[0].font.size = Pt(9.5)
        sub.runs[0].font.color.rgb = RGBColor(100, 116, 139)

        # Summary
        if resume_data.get("summary"):
            doc.add_heading("PROFESSIONAL SUMMARY", level=1)
            doc.add_paragraph(resume_data["summary"])

        # Skills
        tech = resume_data.get("technical_skills", [])
        if tech:
            doc.add_heading("TECHNICAL SKILLS", level=1)
            doc.add_paragraph(f"Skills & Technologies: {', '.join(tech)}")

        # Projects
        if resume_data.get("projects"):
            doc.add_heading("KEY PROJECTS", level=1)
            for p in resume_data["projects"]:
                p_head = doc.add_paragraph()
                r1 = p_head.add_run(f"{p.get('title')} ({p.get('role')})")
                r1.bold = True
                if p.get("technologies"):
                    r2 = p_head.add_run(f" - [{p.get('technologies')}]")
                    r2.font.color.rgb = RGBColor(100, 116, 139)
                for b in p.get("bullets", []):
                    doc.add_paragraph(b, style='List Bullet')

        # Internships
        if resume_data.get("internships"):
            doc.add_heading("PRACTICAL EXPERIENCE", level=1)
            for i in resume_data["internships"]:
                i_head = doc.add_paragraph()
                r1 = i_head.add_run(f"{i.get('position')} - {i.get('company')} ({i.get('duration')})")
                r1.bold = True
                for b in i.get("bullets", []):
                    doc.add_paragraph(b, style='List Bullet')

        # Education
        if resume_data.get("education"):
            doc.add_heading("EDUCATION", level=1)
            for e in resume_data["education"]:
                doc.add_paragraph(f"{e.get('degree')} in {e.get('department')} - {e.get('institution')} ({e.get('graduation_year')}) | CGPA: {e.get('cgpa', 'N/A')}")

        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_cover_letter_pdf(cover_letter_data: Dict[str, Any]) -> bytes:
        """Generate PDF cover letter."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
        styles = getSampleStyleSheet()

        elements = []
        head_style = ParagraphStyle('CLHead', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=16, textColor=colors.HexColor('#1E293B'))
        body_style = ParagraphStyle('CLBody', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=16, spaceAfter=12, textColor=colors.HexColor('#334155'))

        elements.append(Paragraph(cover_letter_data.get("student_name", "Student Name"), head_style))
        elements.append(Paragraph(f"{cover_letter_data.get('student_email', '')} | {cover_letter_data.get('student_phone', '')}", styles['Normal']))
        elements.append(Spacer(1, 14))

        meta = f"<b>To:</b> Hiring Team, {cover_letter_data.get('target_company')}<br/><b>Role:</b> {cover_letter_data.get('target_role')}"
        elements.append(Paragraph(meta, body_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceBefore=6, spaceAfter=14))

        content = cover_letter_data.get("content", "")
        paragraphs = content.split("\n\n")
        for p in paragraphs:
            if p.strip():
                elements.append(Paragraph(p.strip().replace("\n", "<br/>"), body_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_skill_gap_pdf(gap_data: Dict[str, Any]) -> bytes:
        """Generate a structured PDF report for skill gap analysis."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        elements = []
        title = Paragraph(f"Skill-Gap Analysis Report: {gap_data.get('target_role')}", styles['Heading1'])
        elements.append(title)
        elements.append(Paragraph(f"Overall Role Compatibility Score: <b>{gap_data.get('overall_match_score')}%</b>", styles['Normal']))
        elements.append(Spacer(1, 10))

        # Existing Skills Table
        elements.append(Paragraph("<b>1. Matched Proficient Skills:</b>", styles['Heading2']))
        for s in gap_data.get("existing_skills", []):
            elements.append(Paragraph(f"• <b>{s['skill_name']}</b> (Proficiency: {s['student_proficiency']}/5, Target: {s['required_proficiency']}/5)", styles['Normal']))

        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<b>2. Skills Requiring Improvement:</b>", styles['Heading2']))
        for s in gap_data.get("improvement_skills", []):
            elements.append(Paragraph(f"• <b>{s['skill_name']}</b> - Current: {s['student_proficiency']}/5 → Required: {s['required_proficiency']}/5 (Priority: {s['priority_level'].upper()})", styles['Normal']))

        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<b>3. Critical Missing Skills:</b>", styles['Heading2']))
        for s in gap_data.get("missing_skills", []):
            elements.append(Paragraph(f"• <b>{s['skill_name']}</b> (Required: {s['required_proficiency']}/5, Priority: {s['priority_level'].upper()})", styles['Normal']))

        elements.append(Spacer(1, 10))
        elements.append(Paragraph("<b>4. Recommended Learning Sequence:</b>", styles['Heading2']))
        for seq in gap_data.get("learning_sequence", []):
            elements.append(Paragraph(f"• {seq}", styles['Normal']))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

doc_export_service = DocExportService()

