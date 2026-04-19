<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式 - 儿童友好主题 */
	@import url('./uni.scss');

	* {
		box-sizing: border-box;
	}

	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		background-color: #FFF8DC;
		font-size: 32rpx;
		line-height: 1.8;
		--kid-font-body: 26rpx;
		--kid-font-title: 34rpx;
		--kid-video-max-width: 640rpx;
		--kid-video-height: 280rpx;
	}

	/* 手机竖屏：文字稍大、视频稍高，便于孩子看清细节 */
	@media screen and (max-width: 900px) and (orientation: portrait) {
		page {
			--kid-font-body: 27rpx;
			--kid-font-title: 35rpx;
			--kid-video-max-width: 660rpx;
			--kid-video-height: 292rpx;
		}
	}

	/* 平板横屏：视频相对更矮，避免占用过多纵向空间 */
	@media screen and (min-width: 901px) and (orientation: landscape) {
		page {
			--kid-font-body: 24rpx;
			--kid-font-title: 32rpx;
			--kid-video-max-width: 560rpx;
			--kid-video-height: 224rpx;
		}
	}

	/* 全局视频适配：
	   1) 视频框适度缩小，避免占屏过大
	   2) 统一 contain，确保完整画面可见 */
	video {
		object-fit: contain !important;
		background: #000 !important;
		border-radius: 12rpx;
	}

	video:not(.attachment-video):not(.pending-video) {
		width: 100% !important;
		max-height: 420px !important;
	}

	.video-wrap,
	.video-player-wrap,
	.video-wrapper {
		width: 100%;
		max-width: 760px !important;
		margin-left: auto !important;
		margin-right: auto !important;
	}

	.video-block,
	.video-box {
		width: 100%;
		max-width: 820px !important;
		margin-left: auto !important;
		margin-right: auto !important;
	}

	.video-player-wrap {
		padding-top: 56.25% !important;
	}

	@media screen and (max-width: 900px) {
		video:not(.attachment-video):not(.pending-video) {
			max-height: 300px !important;
		}

		.video-wrap,
		.video-player-wrap,
		.video-wrapper,
		.video-block,
		.video-box {
			max-width: 100% !important;
		}
	}

	/* 儿童可读性增强：
	   保留原有风格的同时，把正文与标题整体放大一档 */
	.step-desc,
	.section-title,
	.section-subtitle,
	.block-title,
	.block-tip,
	.logic-text,
	.video-tip,
	.video-desc,
	.voice-text,
	.preview-label,
	.preview-content,
	.generated-tip,
	.tips-title,
	.tips-text,
	.item-name,
	.item-summary,
	.item-action,
	.category-desc,
	.flow-subtitle,
	.tab-text,
	.cell,
	.picker-text,
	.record-option,
	.flow-item,
	.file-row,
	.note-input,
	.label,
	.textarea,
	.watch-badge,
	.watch-btn,
	.dialog-text,
	.dialog-empty,
	.dialog-input,
	.btn,
	.mini-btn,
	.op-head,
	.op-desc,
	.result-name,
	.result-state,
	.token-name,
	.part-name,
	.drag-ghost-name,
	.chip,
	.next-tip {
		font-size: var(--kid-font-body) !important;
		line-height: 1.6 !important;
	}

	.step-title,
	.flow-title,
	.hero-title,
	.card-title,
	.category-title,
	.zone-title,
	.materials-title,
	.result-title,
	.analysis-title,
	.step-card .head {
		font-size: var(--kid-font-title) !important;
		line-height: 1.45 !important;
	}

	view, text, input, textarea, button {
		font-size: inherit;
	}

	input, textarea {
		font-size: 32rpx;
	}

	button {
		font-size: 34rpx;
	}

	.font-title {
		font-size: 40rpx;
		font-weight: 700;
	}

	.font-subtitle {
		font-size: 36rpx;
		font-weight: 600;
	}

	.font-body {
		font-size: 32rpx;
	}

	.font-small {
		font-size: 28rpx;
	}

	.font-tiny {
		font-size: 24rpx;
	}

	.cute-table {
		width: 100%;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.15);
	}

	.cute-table-header {
		background: linear-gradient(135deg, #FF6B9D, #FFB347);
		color: white;
		font-size: 30rpx;
		font-weight: 700;
		padding: 20rpx 16rpx;
		text-align: center;
	}

	.cute-table-row {
		background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
		border-bottom: 3rpx dashed rgba(255, 182, 193, 0.4);
		padding: 16rpx;
		font-size: 30rpx;
	}

	.cute-table-row:nth-child(even) {
		background: linear-gradient(135deg, #F0F8FF, #F5FFF5);
	}

	.cute-table-row:last-child {
		border-bottom: none;
	}

	.cute-table-cell {
		padding: 12rpx 8rpx;
		font-size: 30rpx;
		color: #8B4513;
		text-align: center;
	}

	.cute-input {
		width: 100%;
		min-height: 80rpx;
		padding: 16rpx 20rpx;
		font-size: 32rpx;
		border: 3rpx solid rgba(255, 182, 193, 0.5);
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.9);
		color: #8B4513;
		transition: all 0.3s ease;
	}

	.cute-input:focus {
		border-color: #FF6B9D;
		box-shadow: 0 0 0 6rpx rgba(255, 107, 157, 0.2);
		transform: scale(1.02);
	}

	.cute-textarea {
		width: 100%;
		min-height: 160rpx;
		padding: 20rpx;
		font-size: 32rpx;
		border: 3rpx solid rgba(255, 182, 193, 0.5);
		border-radius: 24rpx;
		background: rgba(255, 255, 255, 0.9);
		color: #8B4513;
		line-height: 1.8;
		transition: all 0.3s ease;
	}

	.cute-textarea:focus {
		border-color: #FF6B9D;
		box-shadow: 0 0 0 6rpx rgba(255, 107, 157, 0.2);
	}

	.cute-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		padding: 20rpx 40rpx;
		font-size: 32rpx;
		font-weight: 700;
		border-radius: 999rpx;
		color: white;
		transition: all 0.3s ease;
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
	}

	.cute-btn:active {
		transform: scale(0.95);
	}

	.cute-btn-primary {
		background: linear-gradient(135deg, #FF6B9D, #FFB347);
		box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.4);
	}

	.cute-btn-success {
		background: linear-gradient(135deg, #56AB2F, #A8E063);
		box-shadow: 0 6rpx 16rpx rgba(86, 171, 47, 0.4);
	}

	.cute-btn-info {
		background: linear-gradient(135deg, #4FACFE, #00F2FE);
		box-shadow: 0 6rpx 16rpx rgba(79, 172, 254, 0.4);
	}

	.cute-btn-warning {
		background: linear-gradient(135deg, #F093FB, #F5576C);
		box-shadow: 0 6rpx 16rpx rgba(240, 147, 251, 0.4);
	}

	.cute-section {
		background: white;
		border-radius: 32rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.12);
		border: 3rpx solid rgba(255, 182, 193, 0.3);
	}

	.cute-section-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding-bottom: 16rpx;
		margin-bottom: 16rpx;
		border-bottom: 4rpx dashed rgba(255, 182, 193, 0.4);
	}

	.cute-section-icon {
		font-size: 40rpx;
	}

	.cute-section-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #D63384;
	}

	.cute-label {
		display: block;
		font-size: 30rpx;
		font-weight: 600;
		color: #8B5A2B;
		margin-bottom: 12rpx;
	}

	.cute-form-group {
		margin-bottom: 20rpx;
	}

	.cute-picker {
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		font-size: 32rpx;
		border: 3rpx solid rgba(255, 182, 193, 0.5);
		border-radius: 20rpx;
		background: rgba(255, 255, 255, 0.9);
		color: #8B4513;
	}

	.cute-card-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.cute-card-item {
		flex: 1;
		min-width: 280rpx;
		background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
		border-radius: 24rpx;
		padding: 20rpx;
		border: 3rpx solid rgba(255, 182, 193, 0.3);
	}

	.cute-empty {
		padding: 60rpx 40rpx;
		text-align: center;
		background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
		border-radius: 24rpx;
		border: 4rpx dashed rgba(255, 182, 193, 0.5);
	}

	.cute-empty-icon {
		font-size: 80rpx;
		margin-bottom: 20rpx;
	}

	.cute-empty-text {
		font-size: 32rpx;
		color: #8B5A2B;
	}

	/* 全局动画定义 */
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	@keyframes wobble {
		0%, 100% { transform: rotate(-3deg); }
		50% { transform: rotate(3deg); }
	}

	@keyframes bounce-soft {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.05); }
	}

	@keyframes spin-slow {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	@keyframes sparkle {
		0%, 100% { opacity: 0; transform: scale(0); }
		50% { opacity: 1; transform: scale(1); }
	}

	@keyframes rainbow {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	@keyframes pop-in {
		0% { opacity: 0; transform: scale(0.3); }
		50% { transform: scale(1.1); }
		100% { opacity: 1; transform: scale(1); }
	}

	@keyframes slide-up {
		0% { opacity: 0; transform: translateY(30px); }
		100% { opacity: 1; transform: translateY(0); }
	}

	@keyframes heartbeat {
		0%, 100% { transform: scale(1); }
		14% { transform: scale(1.15); }
		28% { transform: scale(1); }
		42% { transform: scale(1.1); }
		70% { transform: scale(1); }
	}

	@keyframes wiggle {
		0%, 100% { transform: rotate(-5deg); }
		25% { transform: rotate(5deg); }
		50% { transform: rotate(-3deg); }
		75% { transform: rotate(3deg); }
	}

	@keyframes jelly {
		0%, 100% { transform: scale(1, 1); }
		25% { transform: scale(0.95, 1.05); }
		50% { transform: scale(1.05, 0.95); }
		75% { transform: scale(0.98, 1.02); }
	}

	@keyframes glow-pulse {
		0%, 100% { box-shadow: 0 0 10px rgba(255, 107, 107, 0.3); }
		50% { box-shadow: 0 0 25px rgba(255, 107, 107, 0.6); }
	}

	@keyframes star-twinkle {
		0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
		50% { opacity: 0.5; transform: scale(0.8) rotate(180deg); }
	}

	@keyframes bounce-in {
		0% { transform: scale(0); opacity: 0; }
		50% { transform: scale(1.2); }
		70% { transform: scale(0.9); }
		100% { transform: scale(1); opacity: 1; }
	}

	@keyframes shake-cute {
		0%, 100% { transform: translateX(0) rotate(0deg); }
		20% { transform: translateX(-3px) rotate(-2deg); }
		40% { transform: translateX(3px) rotate(2deg); }
		60% { transform: translateX(-2px) rotate(-1deg); }
		80% { transform: translateX(2px) rotate(1deg); }
	}

	@keyframes rainbow-text {
		0% { color: #FF6B6B; }
		16% { color: #FFE66D; }
		33% { color: #4ECDC4; }
		50% { color: #6C5CE7; }
		66% { color: #FF6B6B; }
		83% { color: #F093FB; }
		100% { color: #FF6B6B; }
	}

	@keyframes confetti-fall {
		0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
		100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
	}

	.animate-float { animation: float 3s ease-in-out infinite; }
	.animate-wobble { animation: wobble 2s ease-in-out infinite; }
	.animate-bounce-soft { animation: bounce-soft 2s ease-in-out infinite; }
	.animate-spin-slow { animation: spin-slow 10s linear infinite; }
	.animate-pop-in { animation: pop-in 0.5s ease-out; }
	.animate-slide-up { animation: slide-up 0.5s ease-out; }
	.animate-heartbeat { animation: heartbeat 1.5s ease-in-out infinite; }
	.animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
	.animate-jelly { animation: jelly 0.8s ease-in-out; }
	.animate-glow { animation: glow-pulse 2s ease-in-out infinite; }
	.animate-star { animation: star-twinkle 2s ease-in-out infinite; }
	.animate-bounce-in { animation: bounce-in 0.6s ease-out; }
	.animate-shake-cute { animation: shake-cute 0.5s ease-in-out; }
	.animate-rainbow-text { animation: rainbow-text 3s linear infinite; }

	/* 全局按钮样式 */
	.btn-primary {
		background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
		color: white;
		border: none;
		border-radius: 20px;
		padding: 15px 30px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
	}

	.btn-primary:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(255, 107, 107, 0.5);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-success {
		background: linear-gradient(135deg, #56AB2F 0%, #A8E063 100%);
		color: white;
		border: none;
		border-radius: 20px;
		padding: 15px 30px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
	}

	.btn-success:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(86, 171, 47, 0.5);
	}

	.btn-info {
		background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
		color: white;
		border: none;
		border-radius: 20px;
		padding: 15px 30px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
	}

	.btn-info:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(79, 172, 254, 0.5);
	}

	.btn-warning {
		background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
		color: white;
		border: none;
		border-radius: 20px;
		padding: 15px 30px;
		font-size: 18px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
	}

	.btn-warning:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
	}

	/* 全局卡片样式 */
	.card {
		background: white;
		border-radius: 20px;
		padding: 20px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		border: 3px solid transparent;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
	}

	.card-rainbow {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
		background-size: 200% 200%;
		animation: rainbow 8s ease infinite;
	}

	/* 标题样式 */
	.title-rainbow {
		background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #6C5CE7 75%, #FF6B6B 100%);
		background-size: 200% auto;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: rainbow 4s linear infinite;
	}

	/* 图标容器 */
	.icon-circle {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
	}

	.icon-circle.red { background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); }
	.icon-circle.yellow { background: linear-gradient(135deg, #FFD93D 0%, #FF9F1C 100%); }
	.icon-circle.green { background: linear-gradient(135deg, #56AB2F 0%, #A8E063 100%); }
	.icon-circle.blue { background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%); }
	.icon-circle.purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
	.icon-circle.pink { background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%); }
	.icon-circle.orange { background: linear-gradient(135deg, #FF9A56 0%, #FFCD67 100%); }
	.icon-circle.cyan { background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%); }
	.icon-circle.rainbow {
		background: linear-gradient(135deg, #FF6B6B 0%, #FFE66D 25%, #4ECDC4 50%, #6C5CE7 75%, #F093FB 100%);
		background-size: 200% 200%;
		animation: rainbow 3s ease infinite;
	}

	/* 可爱图标样式 */
	.cute-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 32px;
		animation: bounce-soft 2s ease-in-out infinite;
	}

	.cute-icon-small {
		font-size: 24px;
		animation: wobble 2s ease-in-out infinite;
	}

	.cute-icon-large {
		font-size: 48px;
		animation: float 3s ease-in-out infinite;
	}

	/* 装饰星星 */
	.star-decor {
		position: absolute;
		font-size: 16px;
		color: #FFD93D;
		animation: star-twinkle 2s ease-in-out infinite;
		text-shadow: 0 0 8px rgba(255, 217, 61, 0.6);
	}

	/* 装饰圆点 */
	.dot-decor {
		position: absolute;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		animation: float 2s ease-in-out infinite;
	}

	.dot-decor.pink { background: #FF6B9D; }
	.dot-decor.blue { background: #4FACFE; }
	.dot-decor.yellow { background: #FFD93D; }
	.dot-decor.green { background: #56AB2F; }
	.dot-decor.purple { background: #A855F7; }

	/* 可爱标签 */
	.cute-tag {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		color: white;
		animation: bounce-soft 3s ease-in-out infinite;
	}

	.cute-tag.red { background: linear-gradient(135deg, #FF6B6B, #FF8E53); }
	.cute-tag.blue { background: linear-gradient(135deg, #4FACFE, #00F2FE); }
	.cute-tag.green { background: linear-gradient(135deg, #56AB2F, #A8E063); }
	.cute-tag.yellow { background: linear-gradient(135deg, #FFD93D, #FF9F1C); color: #5D4E37; }
	.cute-tag.purple { background: linear-gradient(135deg, #667eea, #764ba2); }
	.cute-tag.pink { background: linear-gradient(135deg, #F093FB, #F5576C); }
	.cute-tag.rainbow {
		background: linear-gradient(90deg, #FF6B6B, #FFE66D, #4ECDC4, #6C5CE7, #F093FB);
		background-size: 200% 100%;
		animation: rainbow 3s linear infinite;
	}

	/* 可爱徽章 */
	.cute-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 14px;
		border-radius: 25px;
		background: linear-gradient(135deg, #FFE5EC, #FFF0F5);
		border: 2px solid #FFB6C1;
		font-size: 13px;
		color: #D63384;
		font-weight: 600;
		box-shadow: 0 3px 10px rgba(255, 182, 193, 0.4);
	}

	/* 进度条可爱样式 */
	.progress-cute {
		height: 12px;
		border-radius: 12px;
		background: linear-gradient(90deg, #E8F5E9, #F3E5F5);
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.progress-cute-fill {
		height: 100%;
		border-radius: 12px;
		background: linear-gradient(90deg, #4ECDC4, #44A08D, #56AB2F);
		background-size: 200% 100%;
		animation: rainbow 4s linear infinite;
		transition: width 0.5s ease;
	}

	/* 卡片悬浮装饰 */
	.card-decor {
		position: relative;
		overflow: hidden;
	}

	.card-decor::before {
		content: '✨';
		position: absolute;
		top: 8px;
		right: 8px;
		font-size: 14px;
		opacity: 0.6;
		animation: star-twinkle 2s ease-in-out infinite;
	}

	/* 可爱输入框 */
	.input-cute {
		border: 2px solid #E8D5F2;
		border-radius: 15px;
		padding: 12px 16px;
		font-size: 14px;
		background: linear-gradient(135deg, #FFF5F8, #F0F8FF);
		transition: all 0.3s ease;
	}

	.input-cute:focus {
		border-color: #F093FB;
		box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.2);
		transform: scale(1.02);
	}

	/* 可爱分割线 */
	.divider-cute {
		height: 2px;
		background: linear-gradient(90deg, transparent, #FFB6C1, #87CEEB, #98FB98, transparent);
		border-radius: 2px;
	}

	/* 可爱提示框 */
	.tip-cute {
		padding: 12px 16px;
		border-radius: 15px;
		background: linear-gradient(135deg, #FFF9E6, #FFF0F5);
		border-left: 4px solid #FFD93D;
		font-size: 13px;
		color: #8B5A2B;
		animation: slide-up 0.5s ease-out;
	}

	.tip-cute::before {
		content: '💡 ';
	}

	/* 成功提示 */
	.success-cute {
		padding: 12px 16px;
		border-radius: 15px;
		background: linear-gradient(135deg, #E8F5E9, #F1F8E9);
		border-left: 4px solid #4CAF50;
		font-size: 13px;
		color: #2E7D32;
	}

	.success-cute::before {
		content: '✅ ';
	}

	/* 警告提示 */
	.warning-cute {
		padding: 12px 16px;
		border-radius: 15px;
		background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
		border-left: 4px solid #FF9800;
		font-size: 13px;
		color: #E65100;
	}

	.warning-cute::before {
		content: '⚠️ ';
	}

	/* 可爱计数器 */
	.counter-cute {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 8px;
		border-radius: 14px;
		background: linear-gradient(135deg, #FF6B6B, #FF8E53);
		color: white;
		font-size: 14px;
		font-weight: 700;
		box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
		animation: bounce-soft 2s ease-in-out infinite;
	}

	/* 可爱头像框 */
	.avatar-cute {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		border: 3px solid;
		border-image: linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4) 1;
		padding: 2px;
		background: white;
	}

	/* 可爱步骤指示器 */
	.step-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.step-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #E0E0E0;
		transition: all 0.3s ease;
	}

	.step-dot.active {
		background: linear-gradient(135deg, #FF6B6B, #FF8E53);
		animation: bounce-soft 1s ease-in-out infinite;
		box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
	}

	.step-dot.done {
		background: linear-gradient(135deg, #56AB2F, #A8E063);
	}

	/* 可爱波浪背景 */
	.wave-bg {
		position: relative;
		overflow: hidden;
	}

	.wave-bg::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 30px;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120'%3E%3Cpath fill='%23ffffff' d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8c0-18.89,12.86-35.36,31.17-39.36Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
		background-size: 1200px 30px;
		animation: wave 10s linear infinite;
	}

	@keyframes wave {
		0% { background-position-x: 0; }
		100% { background-position-x: 1200px; }
	}

	/* 可爱阴影效果 */
	.shadow-cute {
		box-shadow: 
			0 4px 6px rgba(255, 107, 107, 0.1),
			0 8px 15px rgba(78, 205, 196, 0.1),
			0 12px 24px rgba(108, 92, 231, 0.08);
	}

	.shadow-cute-hover:hover {
		box-shadow: 
			0 8px 12px rgba(255, 107, 107, 0.15),
			0 16px 30px rgba(78, 205, 196, 0.15),
			0 24px 48px rgba(108, 92, 231, 0.12);
		transform: translateY(-3px);
	}

	/* 可爱渐变文字 */
	.text-gradient-cute {
		background: linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #6C5CE7);
		background-size: 300% 300%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: rainbow 4s ease infinite;
	}

	/* 可爱边框 */
	.border-cute {
		border: 3px solid transparent;
		background: linear-gradient(white, white) padding-box,
		            linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4, #6C5CE7) border-box;
		border-radius: 20px;
	}

	/* 可爱涟漪效果 */
	.ripple-cute {
		position: relative;
		overflow: hidden;
	}

	.ripple-cute::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.6s, height 0.6s;
	}

	.ripple-cute:active::after {
		width: 200%;
		height: 200%;
	}
</style>
