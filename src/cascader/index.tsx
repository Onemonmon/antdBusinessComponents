/**
 * 关键字：授权区域选择
 * 新增人：徐友万
 * 完善中
 */
import React, { useEffect, useState } from 'react';
import { Cascader } from 'antd';
import classnames from 'classnames';
import { CascaderOptionType, CascaderProps } from 'antd/lib/cascader';

// 获取数据的接口返回类型
export type LoadDataRes = {
  value?: CascaderOptionType[];
};
interface IProps {
  value: string[] | number[]; // 值
  options?: CascaderOptionType[]; // 树结构
  needFillData?: boolean; // 是否需要回填数据
  loadData?: (code?: string | number) => Promise<LoadDataRes>; // 异步加载数据
  loadTopData?: () => Promise<LoadDataRes>; // 加载第一级数据
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  [propName: string]: any;
}

let index = 0;
const AreaCascader: React.FC<IProps> = props => {
  const {
    value = [],
    options = [],
    needFillData,
    loadTopData,
    loadData,
    prefixCls,
    className,
    style,
    ...rest
  } = props;
  // 第一级节点初始化
  const [topDataInit, setTopDataInit] = useState<boolean>(false);
  // 数据回填初始化
  const [fillDataInit, setFillDataInit] = useState<boolean>(false);
  // 区域选择树节点
  const [newOptions, setNewOptions] = useState<CascaderOptionType[]>(options);
  // 异步加载节点数据
  const handleLoadData = async (selectedOptions: CascaderOptionType[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    if (loadData) {
      const res = await loadData(targetOption.value);
      targetOption.loading = false;
      const data = res.value;
      if (data) {
        const newData = data;
        targetOption.children = newData;
        setNewOptions([...newOptions]);
        return newData;
      }
    }
    return [];
  };
  // 异步数据回填
  const handleFillData = async (parentOptions: CascaderOptionType[]) => {
    const data = parentOptions.filter(option => option.value === value[index]);
    const res = await handleLoadData(data);
    index += 1;
    if (res && index !== value.length - 1) {
      handleFillData(res);
    }
  };
  // 初始化第一级树节点
  useEffect(() => {
    const getTopData = async () => {
      if (loadTopData) {
        const res = await loadTopData();
        const data = res.value;
        if (data && data.length) {
          const newData = data;
          setNewOptions(newData);
          setTopDataInit(true);
        }
      }
    };
    index = 0;
    getTopData();
  }, []);
  // 需要回填数据 递归创建树结构
  useEffect(() => {
    if (topDataInit && !fillDataInit && value.length && needFillData) {
      setFillDataInit(true);
      handleFillData(newOptions);
    }
  }, [value, topDataInit, fillDataInit, needFillData]);
  return (
    <div
      className={classnames(className, `${prefixCls}-wrapper`)}
      style={style}
    >
      <Cascader
        loadData={handleLoadData}
        value={value}
        options={newOptions}
        {...rest}
      />
    </div>
  );
};

AreaCascader.defaultProps = {
  value: [],
  options: [],
  needFillData: false,
  prefixCls: `${CONTRIBUTOR}-cascader`,
  className: '',
  style: {},
};

export default AreaCascader;
