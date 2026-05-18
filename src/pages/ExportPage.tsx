import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { downloadCSV, exportPurchaseCSV, exportSaleCSV, exportVATSummaryCSV } from '@/features/export/csv';
import { downloadJSON, exportJSON } from '@/features/export/json';
import { exportXLSX } from '@/features/export/xlsx';
import { selectByYear, useTransactionStore } from '@/features/transactions/store';

interface ExportPageProps {
  year: number;
}

export function ExportPage({ year }: ExportPageProps) {
  const transactions = useTransactionStore((state) => state.transactions);
  const yearTxns = useMemo(() => selectByYear(transactions, year), [transactions, year]);
  const { showToast } = useToast();

  const handle = (download: () => void, label: string) => {
    try {
      download();
      showToast(`${label} 다운로드를 시작합니다.`, 'success');
    } catch {
      showToast('다운로드에 실패했습니다.', 'error');
    }
  };

  const sections = [
    {
      heading: 'Excel (세무대리인 권장)',
      items: [
        {
          title: `THAIDAI_매입매출장부_${year}.xlsx`,
          desc: '매출·매입·부가세 요약 3개 시트 통합 워크북',
          accent: true,
          onClick: () => handle(() => exportXLSX(yearTxns, year), 'Excel 워크북'),
        },
      ],
    },
    {
      heading: 'CSV (개별 파일)',
      items: [
        {
          title: '매출 CSV',
          desc: '매출 내역 (UTF-8 BOM, 아티스트명·곡명 포함)',
          accent: false,
          onClick: () =>
            handle(
              () => downloadCSV(exportSaleCSV(yearTxns), `THAIDAI_매출장부_${year}.csv`),
              '매출 CSV',
            ),
        },
        {
          title: '매입 CSV',
          desc: '매입 내역 (UTF-8 BOM)',
          accent: false,
          onClick: () =>
            handle(
              () => downloadCSV(exportPurchaseCSV(yearTxns), `THAIDAI_매입장부_${year}.csv`),
              '매입 CSV',
            ),
        },
        {
          title: '부가세 요약 CSV',
          desc: '4개 분기 납부/환급 요약',
          accent: false,
          onClick: () =>
            handle(
              () => downloadCSV(exportVATSummaryCSV(yearTxns, year), `THAIDAI_부가세요약_${year}.csv`),
              '부가세 요약 CSV',
            ),
        },
      ],
    },
    {
      heading: '백업',
      items: [
        {
          title: 'JSON 백업',
          desc: '전체 데이터 백업 및 추후 복원용 파일',
          accent: false,
          onClick: () =>
            handle(
              () => downloadJSON(exportJSON(yearTxns, year), `THAIDAI_백업_${year}.json`),
              'JSON 백업',
            ),
        },
      ],
    },
  ];

  return (
    <div className="p-4 space-y-6" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div>
        <h2 className="font-display text-2xl text-black-ink">{year}년 데이터 내보내기</h2>
        <p className="text-sm font-body text-grey-border mt-1">
          세무대리인에게 Excel 또는 CSV로 제출하거나 JSON으로 전체 백업합니다.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.heading}>
          <h3 className="font-body text-xs font-medium text-walnut uppercase tracking-widest mb-2">
            {section.heading}
          </h3>
          <div className="space-y-2">
            {section.items.map((item) => (
              <Card
                key={item.title}
                className={`flex items-center justify-between gap-4 ${item.accent ? 'border-burnt-orange' : ''}`}
              >
                <div>
                  <p className="font-mono text-sm text-black-ink font-medium">{item.title}</p>
                  <p className="font-body text-xs text-grey-border mt-0.5">{item.desc}</p>
                </div>
                <Button
                  variant={item.accent ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={item.onClick}
                  className="flex-shrink-0"
                >
                  다운로드
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-cream-dark border-2 border-walnut-dark p-4">
        <p className="text-xs font-body text-walnut leading-relaxed">
          <strong>인코딩:</strong> UTF-8 with BOM (한글 깨짐 방지)
          <br />
          <strong>정렬:</strong> 거래일자 오름차순
          <br />
          <strong>음악 정보:</strong> 매출 파일에 아티스트명과 곡명 컬럼이 별도로 포함됩니다.
        </p>
      </div>
    </div>
  );
}
