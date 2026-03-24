# 敏感词库目录

此目录用于存放敏感词库文件。

## 如何设置敏感词库

### 方法1：克隆开源词库

```bash
cd backend/data
git clone https://github.com/konsheng/Sensitive-lexicon.git
cp Sensitive-lexicon/Vocabulary/*.txt sensitive-words/
rm -rf Sensitive-lexicon
```

### 方法2：手动下载

1. 访问 https://github.com/konsheng/Sensitive-lexicon
2. 下载 `Vocabulary` 目录下的所有 `.txt` 文件
3. 将文件放置到 `data/sensitive-words/` 目录中

## 敏感词分类

当前包含的敏感词分类：

- 政治类型
- 色情类型
- 暴恐词库
- 涉枪涉爆
- 贪腐词库
- 民生词库
- 广告类型
- 其他词库
- 网易前端过滤敏感词库
- GFW补充词库
- 非法网址
- 新思想启蒙
- 反动词库
- 补充词库
- 零时-Tencent
- COVID-19词库

## 词库统计

- 总敏感词数量：约 87,000+
- 分类数量：17 个

## 注意事项

- 敏感词库不会被提交到 Git 仓库（已在 .gitignore 中配置）
- 在部署到 Cloudflare Workers 时，需要将敏感词库文件上传
- 建议定期更新敏感词库以保持时效性

## 隐私和安全

敏感词库包含政治敏感词汇，仅供内容审核使用，请确保：
- 仅用于合法的内容审核目的
- 遵守当地法律法规
- 不滥用敏感词数据
- 保护用户隐私