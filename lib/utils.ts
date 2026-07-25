import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Appointment } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

// ICS Calendar Event Exporter
export function downloadICS(appointment: Appointment) {
  const [year, month, day] = appointment.date.split('-');
  const [startHour, startMin] = appointment.start_time.split(':');
  const [endHour, endMin] = appointment.end_time.split(':');

  const dtStart = `${year}${month}${day}T${startHour}${startMin}00`;
  const dtEnd = `${year}${month}${day}T${endHour}${endMin}00`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Konnexy Agenda//NONSGML v1.0//PT
BEGIN:VEVENT
UID:${appointment.id}@konnexyagenda.com.br
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${appointment.service_name} com ${appointment.professional_name}
DESCRIPTION:Agendamento de ${appointment.service_name} no Konnexy Agenda.\\nProfissional: ${appointment.professional_name}\\nValor: ${formatCurrency(appointment.final_price)}
LOCATION:Alameda Gabriel Monteiro da Silva, 1420 - Jardins, São Paulo - SP
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Agendamento-${appointment.date}-${appointment.start_time}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// CSV Exporter
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PDF Receipt Generator
export function generateReceiptPDF(appointment: Appointment) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(192, 132, 151); // #C08497
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('KONNEXY AGENDA', 15, 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPROVANTE DE AGENDAMENTO E PAGAMENTO', 15, 30);

  // Content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  
  doc.text(`Comprovante Nº: #${appointment.id}`, 15, 50);
  doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 130, 50);

  doc.setLineWidth(0.5);
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 55, 195, 55);

  // Table Details
  autoTable(doc, {
    startY: 65,
    head: [['Item / Descrição', 'Profissional', 'Data / Horário', 'Valor']],
    body: [
      [
        appointment.service_name || 'Serviço de Salão',
        appointment.professional_name || 'Profissional',
        `${formatDate(appointment.date)} às ${appointment.start_time}`,
        formatCurrency(appointment.price)
      ],
    ],
    headStyles: { fillColor: [192, 132, 151], textColor: 255 },
    theme: 'grid',
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;

  // Summary
  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(appointment.price)}`, 140, finalY + 15);
  doc.text(`Desconto Aplicado: -${formatCurrency(appointment.discount)}`, 140, finalY + 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(192, 132, 151);
  doc.text(`TOTAL PAGO: ${formatCurrency(appointment.final_price)}`, 140, finalY + 32);

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Obrigado pela preferência! Em caso de dúvidas ou reagendamento, entre em contato.', 15, 270);
  doc.text('Alameda Gabriel Monteiro da Silva, 1420 - Jardins, SP | Tel: (11) 98765-4321', 15, 276);

  doc.save(`Comprovante-${appointment.client_name.replace(/\s+/g, '_')}.pdf`);
}
