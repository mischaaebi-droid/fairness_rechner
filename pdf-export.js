
/* PDF-Export Steuerrechner – keine eigenen Steuerformeln.
   jsPDF und jsPDF-AutoTable werden erst beim Klick geladen.
   Die Berechnungswerte kommen aus berechnungen.js. */

(() => {
  'use strict';

  const btn = document.getElementById('downloadPdf');
  if (!btn) return;

  const get = (id) => document.getElementById(id);
  const num = (id) => Number(get(id)?.value || 0);

  const money = (amount) => 'CHF ' + new Intl.NumberFormat('de-CH', {
    maximumFractionDigits: 0
  }).format(Math.round(amount)).replace(/[’']/g, ' ');

  const difference = (value, base) => {
    const d = value - base;
    return Math.abs(d) <= .5
      ? 'unverändert'
      : money(Math.abs(d)) + (d < 0 ? ' weniger' : ' mehr');
  };

  const clean = (s) => String(s || '')
    .replace(/[’‘]/g, "'")
    .replace(/[–—−]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Tabellenwerte aus dem bestehenden Testtool lesen.
  function extractTable(table) {
    const head = [], body = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cells = [...row.children].filter(c => c.matches('td,th'));

      const parsed = cells.map(c => {
        const value = clean(
          c.innerHTML
            .replace(/<br\s*\/?\s*>/gi, ' / ')
            .replace(/<[^>]+>/g, ' ')
        );

        return c.colSpan > 1
          ? { content: value, colSpan: c.colSpan }
          : value;
      });

      if (row.closest('thead')) head.push(parsed);
      else if (row.closest('tbody')) body.push(parsed);
    });

    return { head, body };
  }

  function heading(doc, title, subtitle) {
    doc.setTextColor(32, 35, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, 15, 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(95, 95, 105);
    doc.text(subtitle, 15, 26);
  }

  // Bibliotheken dynamisch vom eigenen GitHub Pages laden.
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;

      script.onload = resolve;

      script.onerror = () => {
        script.remove();
        reject(new Error(
          'Die Datei ' + src + ' konnte nicht geladen werden.'
        ));
      };

      document.head.appendChild(script);
    });
  }

  let loadingLibraries = null;

  function ensurePdfLibraries() {
    if (
      window.jspdf?.jsPDF &&
      typeof window.jspdf.jsPDF.API.autoTable === 'function'
    ) {
      return Promise.resolve();
    }

    if (!loadingLibraries) {
      loadingLibraries = (async () => {
        if (!window.jspdf?.jsPDF) {
          await loadScript('jspdf.umd.min.js');
        }

        if (
          typeof window.jspdf?.jsPDF?.API?.autoTable !== 'function'
        ) {
          await loadScript('jspdf.plugin.autotable.min.js');
        }

        if (
          typeof window.jspdf?.jsPDF?.API?.autoTable !== 'function'
        ) {
          throw new Error(
            'Die PDF-Tabellenbibliothek ist nicht verfügbar.'
          );
        }
      })().catch(error => {
        loadingLibraries = null;
        throw error;
      });
    }

    return loadingLibraries;
  }

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'PDF wird vorbereitet …';

    try {
      await ensurePdfLibraries();

      if (typeof window.taxExportCalculate !== 'function') {
        throw new Error(
          'Die Steuerberechnung ist nicht verfügbar.'
        );
      }

      const doc = new window.jspdf.jsPDF({
        unit: 'mm',
        format: 'a4'
      });

      if (typeof doc.autoTable !== 'function') {
        throw new Error(
          'Die PDF-Tabellenbibliothek wurde nicht geladen.'
        );
      }

      const income1 = num('income1');
      const income2 = num('income2');
      const children = num('kids');

      const retired1 = !!get('retired1')?.checked;
      const retired2 = !!get('retired2')?.checked;

      const r = window.taxExportCalculate(
        income1,
        income2,
        children,
        retired1,
        retired2
      );

      const currentVariant =
        get('bestBtn')?.classList.contains('active')
          ? 'Günstigere Auslegung'
          : 'Ungünstigere Auslegung';

      const date = new Date().toLocaleDateString('de-CH');

      const common = {
        theme: 'grid',
        margin: { left: 15, right: 15 },
        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.5,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [32, 35, 70],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 248, 252]
        }
      };

      // Seite 1: Eingaben und Ergebnisübersicht.
      heading(
        doc,
        'Steuerberechnung für Ehepaare',
        'Direkte Bundessteuer | Berechnungsstand: ' + date
      );

      doc.autoTable({
        ...common,
        startY: 33,
        head: [['Ihre Angaben', 'Wert']],
        body: [
          [
            'Nettoeinkommen Person 1',
            money(income1) + (retired1 ? ' (pensioniert)' : '')
          ],
          [
            'Nettoeinkommen Person 2',
            money(income2) + (retired2 ? ' (pensioniert)' : '')
          ],
          [
            'Unterstützungspflichtige Kinder',
            String(children)
          ]
        ]
      });

      doc.autoTable({
        ...common,
        startY: doc.lastAutoTable.finalY + 7,
        head: [[
          'Steuersystem',
          'Jährliche Steuer',
          'Vergleich mit heute'
        ]],
        body: [
          [
            'Heutige gemeinsame Besteuerung',
            money(r.taxToday),
            '-'
          ],
          [
            'Mitte-Initiative: ungünstigere Auslegung',
            money(r.initiativeTaxWithoutDeductions),
            difference(
              r.initiativeTaxWithoutDeductions,
              r.taxToday
            )
          ],
          [
            'Mitte-Initiative: günstigere Auslegung',
            money(r.initiativeTaxWithDeductions),
            difference(
              r.initiativeTaxWithDeductions,
              r.taxToday
            )
          ],
          [
            'Individualbesteuerung',
            money(r.individualTax),
            difference(r.individualTax, r.taxToday)
          ]
        ]
      });

      let y = doc.lastAutoTable.finalY + 9;

      doc.setTextColor(32, 35, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(
        'Zwei mögliche Umsetzungen der Mitte-Initiative',
        15,
        y
      );

      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const notes = [
        'Der Bundesrat hat bei der Umsetzung per Verordnung Spielraum.',
        'Der Rechner zeigt die steuerlich günstigere und ungünstigere Auslegung.',
        'Für die Initiative zählt jeweils die tiefere von zwei Berechnungen.',
        'Die folgenden Tabellen zeigen Details nur zu dem dem jeweils aktuell im Rechner gewählten Modus (günstig oder ungünstig)'
      ];

notes.forEach((line, i) => {
  if (i === 3) {
    const highlight = 'nur zu dem dem jeweils aktuell im Rechner gewählten Modus';
    const parts = line.split(highlight);
    const x = 15;

    // Text vor der Hervorhebung
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(32, 35, 70);
    doc.text(parts[0], x, y);

    const xHighlight = x + doc.getTextWidth(parts[0].trimEnd()) + doc.getTextWidth('  ');

    // Hervorhebung: rot und fett, gleiche Schriftgrösse
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    doc.text(highlight, xHighlight, y);

    const xRest = xHighlight + doc.getTextWidth(highlight);

    // Restlicher Text wieder normal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(32, 35, 70);
    doc.text(parts[1], xRest, y);

  } else {
    doc.text(line, 15, y);
  }

  y += 5;
});

      y += 8;

      doc.setFillColor(241, 241, 248);
      doc.setDrawColor(217, 217, 231);
      doc.roundedRect(15, y, 180, 28, 3, 3, 'FD');

      doc.setTextColor(32, 35, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);

      doc.text(
        'Detaillierte Berechnungen auf den nächsten Seiten',
        21,
        y + 10
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      doc.text(
        'Seite 2: Mitte-Initiative (alle Abzüge und Rechenschritte)',
        21,
        y + 17
      );

      doc.text(
        'Seite 3: Individualbesteuerung (beide Personen im Detail)',
        21,
        y + 23
      );

      // Detailtabellen aus dem Rechner.
      const tables = document.querySelectorAll(
        '#testTools .test-table'
      );

      if (tables.length < 2) {
        throw new Error(
          'Die Detailtabellen konnten nicht gefunden werden.'
        );
      }

      // Seite 2: Fairnessinitiative.
      doc.addPage();

      heading(
        doc,
        'Mitte-Initiative: detaillierte Berechnung',
        'Schalterstellung: ' + clean(currentVariant) +
        ' | Beide Einkommen und Kinderzahl: siehe Seite 1'
      );

      const fair = extractTable(tables[0]);

      doc.autoTable({
        ...common,
        startY: 33,
        head: fair.head,
        body: fair.body,
        styles: {
          ...common.styles,
          fontSize: 7.1,
          cellPadding: 2.0
        },
        columnStyles: {
          0: { cellWidth: 62 }
        },
        didParseCell(data) {
          if (
            data.section === 'body' &&
            data.row.raw?.[0]?.content &&
            data.row.raw[0].colSpan >= 3
          ) {
            data.cell.styles.fillColor = [238, 238, 246];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      });

      // Seite 3: Individualbesteuerung.
      doc.addPage();

      heading(
        doc,
        'Individualbesteuerung: detaillierte Berechnung',
        'Gesetzliche Tarif- und Abzugsannahmen des Rechners | Eingaben: siehe Seite 1'
      );

      const individual = extractTable(tables[1]);

      doc.autoTable({
        ...common,
        startY: 33,
        head: individual.head,
        body: individual.body,
        styles: {
          ...common.styles,
          fontSize: 7.3,
          cellPadding: 2.1
        },
        columnStyles: {
          0: { cellWidth: 61 }
        }
      });

      // Fusszeilen.
      const pages = doc.getNumberOfPages();

      for (let p = 1; p <= pages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 110, 115);

        doc.text(
          'Berechnung anhand der im Steuerrechner hinterlegten Tarife und Abzüge.',
          15,
          286
        );

        doc.text(
          'Seite ' + p + ' / ' + pages,
          195,
          286,
          { align: 'right' }
        );
      }

      doc.save('Bundessteuer-Berechnung.pdf');

    } catch (error) {
      console.error('PDF-Export:', error);

      alert(
        'PDF konnte nicht erstellt werden: ' + error.message
      );

    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
})();
