import { useState } from 'react';
import { ACTS, type Mode } from '../engine/journey';
import { ANSWER, FOLLOW_UPS } from '../engine/interview';
import { Icon } from './icons';
import './interview.css';

export function Interview({ mode }: { mode: Mode }) {
  const kid = mode === 'kid';
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ANSWER.map((a) => a.text).join('\n\n'));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="section" id="interview" aria-labelledby="interview-title">
      <div className="wrap">
        <div className="head">
          <h2 id="interview-title">Answer it in an interview</h2>
          <p>
            {kid
              ? 'This part is for the grown-ups. It is one of the most asked questions in web developer interviews, and now you know the whole story.'
              : 'One of the most common questions in frontend and web-fundamentals rounds. Here is a one-minute answer in six parts, and the follow-ups that usually come next.'}
          </p>
        </div>

        <div className="iv">
          <div className="iv-answer">
            <div className="iv-answer-head">
              <h3>The one-minute answer</h3>
              <button type="button" className="btn btn-sm" onClick={copy}>
                {copied ? Icon.check : Icon.copy}
                {copied ? 'Copied' : 'Copy answer'}
              </button>
            </div>
            <ol>
              {ANSWER.map((a) => {
                const act = ACTS.find((x) => x.id === a.act)!;
                return (
                  <li key={a.act} data-act={a.act}>
                    <span className="iv-part">{act.pro}</span>
                    <p>{a.text}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="iv-follow">
            <h3>What they ask next</h3>
            <div className="iv-list">
              {FOLLOW_UPS.map((f) => (
                <details key={f.q}>
                  <summary>
                    <span>{f.q}</span>
                    <i aria-hidden="true">{Icon.plus}</i>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
