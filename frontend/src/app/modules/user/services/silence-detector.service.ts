import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})export class SilenceDetectorService {
  private stream!: MediaStream;
  private audioContext!: AudioContext;
  private analyser!: AnalyserNode;
  private dataArray!: Uint8Array;
  private silenceTimeout: any = null;
  private detectionRunning = false;

  private reactivationDelay = 7000; // ⏱ Temps entre chaque relance (7s)
  private silenceDelay = 1500;       // ⏱ Durée minimale de silence avant d'agir
  private onSilenceCallback: (() => void) | null = null;

  /**
   * Lance la détection continue de silence avec redémarrage automatique.
   */
  startLoop(onSilence: () => void): void {
    this.onSilenceCallback = onSilence;
    this.detectionRunning = true;
    this.initDetectionCycle();
  }

  /**
   * Exécute un cycle de détection de silence
   */
  private initDetectionCycle(): void {
    console.log("🎧 SilenceDetector → Début de la détection");

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      this.stream = stream;
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.fftSize);

      const detect = () => {
        if (!this.detectionRunning) return;

        this.analyser.getByteTimeDomainData(this.dataArray);
        const isSilent = this.dataArray.every((v) => Math.abs(v - 128) < 5);

        if (isSilent) {
          if (!this.silenceTimeout) {
            this.silenceTimeout = setTimeout(() => {
              console.log("🔇 Silence détecté → Arrêt de l'enregistrement");
              if (this.onSilenceCallback) this.onSilenceCallback();

              clearTimeout(this.silenceTimeout);
              this.silenceTimeout = null;

              // 🔄 Attendre avant de relancer un cycle
              setTimeout(() => {
                console.log("🔁 Reprise automatique de la détection");
                this.cleanup();
                this.initDetectionCycle();
              }, this.reactivationDelay);
            }, this.silenceDelay);
          }
        } else {
          clearTimeout(this.silenceTimeout);
          this.silenceTimeout = null;
        }

        requestAnimationFrame(detect);
      };

      detect();
    }).catch(error => {
      console.error("🎤 Erreur accès micro :", error);
    });
  }

  /**
   * Nettoyage sans relancer toute la logique
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
  }

  /**
   * Arrêt complet du processus (ex: bouton OFF)
   */
  stopDetection(): void {
    this.detectionRunning = false;
    this.cleanup();
    clearTimeout(this.silenceTimeout);
    this.silenceTimeout = null;
    console.log("🛑 SilenceDetector → Arrêt complet");
  }
}
