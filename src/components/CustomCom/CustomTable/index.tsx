import React, { useState, useMemo } from 'react';
import styles from './index.module.scss';
import { Iconify } from '@/components/icon';
import { useLanguage } from '@/hooks/useLanguage';
import { Pagination } from 'antd';
import {NoData} from '@/components/noData';

export interface ColumnType<T = any> {
  title: string | React.ReactNode | ((value: any, record: T, index: number) => React.ReactNode);
  dataIndex?: string;
  key: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  border?: 'border' | 'buttom' | 'none';
  sorter?: boolean | ((a: T, b: T) => number);
  render?: (value: any, record: T, index: number) => React.ReactNode;
  children?: ColumnType<T>[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  hideOnSinglePage?: boolean;
  pageSizeOptions?: string[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface CustomTableProps<T = any> {
  columns: ColumnType<T>[];
  dataSource: T[];
  loading?: boolean;
  pagination?: PaginationConfig | false;
  type?: 'p1' | 'p2'; // p1: 列模式, p2: 行模式
  rowKey?: string | ((record: T) => string);
  p1cardBorder?: 'border'|'buttom'|'none';
  expandable?: {
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  locale?: {
    emptyText?: React.ReactNode;
  };
  className?: string; // 表格样式
  headerClassName?: string; // 表头样式
  bodyClassName?: string; // 表格内容样式
  pageClassName?: string; // 分页样式
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

type SortOrder = 'ascend' | 'descend' | null;

interface SortState {
  columnKey: string | null;
  order: SortOrder;
}

const CustomTable = <T extends Record<string, any>>({
  columns,
  dataSource,
  loading = false,
  pagination = false,
  type = 'p1',
  rowKey = 'id',
  p1cardBorder = 'border',
  expandable,
  locale = { emptyText: <NoData textColor='#A4A5AC' position='top'/> },
  className = '',
  headerClassName = '',
  bodyClassName = '',
  pageClassName = '',
  onRow,
}: CustomTableProps<T>) => {
  const { t } = useLanguage();
  const [sortState, setSortState] = useState<SortState>({
    columnKey: null,
    order: null,
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 获取行的唯一标识
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index.toString();
  };

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortState.columnKey || !sortState.order) {
      return dataSource;
    }

    const column = columns.find(col => col.key === sortState.columnKey);
    if (!column?.sorter) {
      return dataSource;
    }

    const sortedArray = [...dataSource];

    if (typeof column.sorter === 'function') {
      sortedArray.sort(column.sorter);
    } else {
      sortedArray.sort((a, b) => {
        const aValue = a[column.key];
        const bValue = b[column.key];

        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });
    }

    return sortState.order === 'descend' ? sortedArray.reverse() : sortedArray;
  }, [dataSource, sortState, columns]);

  // 处理排序
  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sorter) return;

    setSortState(prev => {
      if (prev.columnKey === columnKey) {
        // 同一列：无序 -> 升序 -> 降序 -> 无序
        if (prev.order === null) return { columnKey, order: 'ascend' };
        if (prev.order === 'ascend') return { columnKey, order: 'descend' };
        return { columnKey: null, order: null };
      } else {
        // 不同列：直接设为升序
        return { columnKey, order: 'ascend' };
      }
    });
  };

  // 处理展开/收起
  const handleExpand = (record: T, index: number) => {
    const key = getRowKey(record, index);
    const newExpandedRows = new Set(expandedRows);

    if (expandedRows.has(key)) {
      newExpandedRows.delete(key);
    } else {
      newExpandedRows.add(key);
    }

    setExpandedRows(newExpandedRows);
  };

  // 渲染排序图标
  const renderSortIcon = (columnKey: string) => {
    const isActive = sortState.columnKey === columnKey;
    const order = isActive ? sortState.order : null;

    return (
      <span className={`${styles.sortIcons} table-sort-icons`}>
        <Iconify
          icon="ph:caret-up-fill"
          className={`${styles.sortIcon} ${order === 'ascend' ? styles.active : ''} table-sort-icon-up`}
        />
        <Iconify
          icon="ph:caret-down-fill"
          className={`${styles.sortIcon} ${order === 'descend' ? styles.active : ''} table-sort-icon-down`}
        />
      </span>
    );
  };

  // 渲染单元格内容
  const renderCellContent = (column: ColumnType<T>, record: T, index: number) => {
    const value = record[column.key];

    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };

  // 渲染标题内容
  const renderTitle = (column: ColumnType<T>, index: number, value?: any, record?: T) => {
    if (typeof column.title === 'function') {
      return column.title(value, record as T, index);
    }
    return column.title;
  };

  // 渲染分页
  const renderPagination = () => {
    if (!pagination || typeof pagination === 'boolean') return null;

    const { current, pageSize, total, onChange ,hideOnSinglePage} = pagination;
    const totalPages = Math.ceil(total / pageSize);

    // 当无数据或总页数小于等于1时不显示分页
    if (hideOnSinglePage && (total === 0 || totalPages <= 1)) return null;

    const handlePageChange = (page: number) => {
      if (onChange && page !== current && page >= 1 && page <= totalPages) {
        onChange(page, pageSize);
      }
    };

    return (
      // <div className={`${styles.pagination} ${pageClassName} table-pagination`}>
      //   <button
      //     className={`${styles.pageBtn} table-pagination-btn-left`}
      //     disabled={current <= 1}
      //     onClick={() => handlePageChange(current - 1)}
      //   >
      //     <Iconify icon="ph:caret-left" className="table-pagination-icon-left" />
      //   </button>

      //   <span className={styles.pageInfo}>
      //     {current} / {totalPages}
      //   </span>

      //   <button
      //     className={`${styles.pageBtn} table-pagination-btn-right`}
      //     disabled={current >= totalPages}
      //     onClick={() => handlePageChange(current + 1)}
      //   >
      //     <Iconify icon="ph:caret-right" className="table-pagination-icon-right" />
      //   </button>
      // </div>
      <div className={`${styles.pagination} ${pageClassName} table-pagination`}>
        <Pagination
          simple
          // position={['bottomRight']}
          className='spot-table-box'
          showSizeChanger
          defaultCurrent={current}
          pageSize={pageSize}
          size='default'
          total={total}
          hideOnSinglePage={hideOnSinglePage}
          onChange={(page, pageSize) => onChange?.(page, pageSize)} />
      </div>
    );
  };

  // 列模式渲染（传统表格）
  const renderColumnMode = () => (
    <div className={`${styles.tableWrapper} ${className}`}>
      {loading && <div className={`${styles.loading} table-loading`}>
        {/* 加载中... */}
        <Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
      </div>}

      <table className={styles.table}>
        <thead className={`${styles.tableHead} ${headerClassName} table-header`}>
          <tr>
            {expandable && <th className={`${styles.expandColumn} table-expand-column`}></th>}
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={`${styles.tableHeader} table-header-item`}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
              >
                <div className={`${styles.headerContent} table-header-content`}>
                  <span className="table-header-title">{renderTitle(column, index, null, undefined)}</span>
                  {column.sorter && (
                    <span
                      className={`${styles.sortTrigger} table-sort-trigger`}
                      onClick={() => handleSort(column.key)}
                    >
                      {renderSortIcon(column.key)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className={`${styles.tableBody} ${bodyClassName} table-body`}>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (expandable ? 1 : 0)}
                className={`${styles.emptyCell} table-empty-cell`}
              >
                {locale.emptyText}
              </td>
            </tr>
          ) : (
            sortedData.map((record, index) => {
              const key = getRowKey(record, index);
              const isExpanded = expandedRows.has(key);
              const rowProps = onRow ? onRow(record, index) : {};

              return (
                <React.Fragment key={key}>
                  <tr className={styles.tableRow} {...rowProps}>
                    {expandable && (
                      <td className={`${styles.expandCell} table-expand-cell`}>
                        {expandable.rowExpandable?.(record) !== false && (
                          <button
                            className={`${styles.expandBtn} table-expand-btn`}
                            onClick={() => handleExpand(record, index)}
                          >
                            <Iconify
                              icon={isExpanded ? "ph:caret-down" : "ph:caret-right"}
                              className="table-expand-icon"
                            />
                          </button>
                        )}
                      </td>
                    )}
                    {columns.map(column => (
                      <td
                        key={column.key}
                        className={`${styles.tableCell} table-cell`}
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {renderCellContent(column, record, index)}
                      </td>
                    ))}
                  </tr>

                  {expandable && isExpanded && expandable.expandedRowRender && (
                    <tr>
                      <td colSpan={columns.length + 1} className={`${styles.expandedRow} table-expanded-row`}>
                        {expandable.expandedRowRender(record, index)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>

      {renderPagination()}
    </div>
  );

  // 行模式渲染（卡片式）
  const renderRowMode = () => (
    <div className={`${styles.cardWrapper} ${className} ${bodyClassName} table-body`}>
      {loading && <div className={styles.loading}>
        {/* 加载中... */}
        <Iconify icon="eos-icons:bubble-loading" size={48} className="theme-color" />
      </div>}

      {sortedData.length === 0 ? (
        <div className={`${styles.emptyCard} table-empty-card`}>
          {locale.emptyText}
        </div>
      ) : (
        sortedData.map((record, index) => {
          const key = getRowKey(record, index);
          const isExpanded = expandedRows.has(key);
          const rowProps = onRow ? onRow(record, index) : {};

          return (
            <div key={key} className={`${styles.card} 
            ${p1cardBorder==='buttom' ? styles.card_bottom_border : 
              p1cardBorder==='none' ? styles.card_bottom_none : ''} 
            table-card`} 
            {...rowProps}>
              {columns.map((column, columnIndex) => (
                <div key={column.key} className={`${styles.cardRow} ${headerClassName}
                 flex-x align-center justify-between table-card-row
                 `}>
                  <div className={`${styles.cardLabel}  table-card-label`}>
                    {renderTitle(column, columnIndex, record[column.key], record)}
                    {column.sorter && (
                      <span
                        className={`${styles.sortTrigger} table-sort-trigger`}
                        onClick={() => handleSort(column.key)}
                      >
                        {renderSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.cardValue} flex-1
                   text-right flex-x align-center justify-end table-card-value`}>
                    {renderCellContent(column, record, index)}
                  </div>
                </div>
              ))}

              {expandable && expandable.rowExpandable?.(record) !== false && (
                <div className={`${styles.cardExpand} table-card-expand`}>
                  <button
                    className={`${styles.expandBtn} table-expand-btn`}
                    onClick={() => handleExpand(record, index)}
                  >
                    <Iconify
                      icon={isExpanded ? "ph:caret-up" : "ph:caret-down"}
                      className="table-expand-icon"
                    />
                    {isExpanded ? t('titleText.collapse') : t('titleText.expand')}
                  </button>

                  {isExpanded && expandable.expandedRowRender && (
                    <div className={`${styles.expandedContent} table-expanded-content`}>
                      {expandable.expandedRowRender(record, index)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}

      {renderPagination()}
    </div>
  );

  return type === 'p1' ? renderRowMode() : renderColumnMode()
};

export default CustomTable; 