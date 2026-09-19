import { DialogButton, ModalRoot, showModal } from "@decky/ui";
import branchSetupGif from "../../assets/lsfg-vk-branch-setup.gif";

export function showBranchSetupModal() {
  let closeModal = () => {};
  const modal = showModal(
    <ModalRoot
      bAllowFullSize
      closeModal={() => closeModal()}
      onCancel={() => closeModal()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          boxSizing: "border-box",
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          padding: "8px 16px 16px",
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
          将 Lossless Scaling 切换至 lsfg-vk 分支
        </div>
        <img
          src={branchSetupGif}
          alt="在 Steam 中选择 lsfg-vk 分支的步骤"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "100%",
            height: "auto",
            boxSizing: "border-box",
            borderRadius: "4px",
            background: "#101418",
          }}
        />
        <ol style={{ lineHeight: 1.5, margin: "14px 0 18px", paddingLeft: "24px" }}>
          <li>在 Steam 库中打开 Lossless Scaling。</li>
          <li>打开属性，然后进入游戏版本与测试版。</li>
          <li>选择 <strong>lsfg-vk</strong> 分支。</li>
          <li>等待 Steam 完成更新后重新打开小黄鸭。</li>
        </ol>
        <DialogButton
          onClick={() => closeModal()}
          style={{ width: "100%" }}
        >
          关闭
        </DialogButton>
      </div>
    </ModalRoot>,
    undefined,
    {
      strTitle: "完成小黄鸭设置",
      bNeverPopOut: true,
      popupWidth: 980,
      popupHeight: 760,
    },
  );
  closeModal = modal.Close;
}
