import { YankiConnect } from "yanki-connect";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnkiCardParse } from "@/entrypoints/content/component/anki/anki-card-parse";

// 로컬 스토리지에 사용할 키
const LOCAL_STORAGE_KEY = "ankiTargetDecks";

// 검색 스로틀링 지연 시간 (밀리초)
const THROTTLE_DELAY = 300;

const client = new YankiConnect();

type Deck = {
  id: number;
  deckPath: string;
  stats: {
    deck_id: number;
    learn_count: number;
    name: string;
    new_count: number;
    review_count: number;
    total_in_deck: number;
  };
};

type CardInfo = {
  answer: string;
  buttons?: number[];
  cardId: number;
  css: string;
  deckName: string;
  due: number;
  fieldOrder: number;
  fields: Record<
    string,
    {
      order: number;
      value: string;
    }
  >;
  interval: number;
  lapses: number;
  left: number;
  mod: number;
  modelName: string;
  nextReviews: string[];
  note: number;
  ord: number;
  question: string;
  queue: number;
  reps: number;
  template: string;
  type: number;
};

export const DeckSetting = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [studyCardInfos, setStudyCardInfos] = useState<CardInfo[]>([]);

  // 현재 검색어
  const [searchInput, setSearchInput] = useState("");

  // 실제로 필터링에 사용되는 검색어 (스로틀링 적용 후 업데이트됨)
  const [searchTerm, setSearchTerm] = useState("");

  // 덱별 스터디 설정 { [deckName: string]: boolean }
  // ⭐️ 초기 상태를 로컬 스토리지에서 불러오는 함수로 설정
  const [targetDecks, setTargetDecks] = useState<string[]>(() => {
    try {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
      // 저장된 값이 있으면 JSON.parse하여 반환, 없거나 에러 발생 시 빈 배열 반환
      return storedValue ? JSON.parse(storedValue) : [];
    } catch (error) {
      console.error(
        "로컬 스토리지에서 'targetDecks' 로드 중 에러 발생:",
        error
      );
      return [];
    }
  });

  // 스로틀링 타이머 관리를 위한 Ref
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 1. 초기 덱 목록 로드 (AnkiConnect)
  useEffect(() => {
    setIsLoading(true);

    try {
      (async () => {
        const deckNameAndIds = await client.deck.deckNamesAndIds();
        const deckNames = Object.keys(deckNameAndIds);

        const deckStats = await client.deck.getDeckStats({
          decks: deckNames,
        });

        const result = Object.entries(deckNameAndIds).map(([deckName, id]) => {
          const matchedStats = deckStats[id];
          return {
            id,
            deckPath: deckName,
            stats: matchedStats,
          };
        });

        setDecks(result);
      })();
    } catch (error) {
      window.alert(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * @Desc target 덱 변경 시 마다 cards 업데이트
   */
  useEffect(() => {
    (async () => {
      const deckQueries = targetDecks.map((d) => `deck:"${d}"`);
      const query = `${deckQueries.join(" OR ")}`;
      const cardIds = await client.card.findCards({
        query,
      });
      const cardInfos = await client.card.cardsInfo({
        cards: cardIds,
      });
      setStudyCardInfos(cardInfos);
    })();
  }, [targetDecks]);

  // ⭐️ 2. targetDecks 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    try {
      // 배열을 문자열로 변환하여 로컬 스토리지에 저장
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(targetDecks));
    } catch (error) {
      console.error("로컬 스토리지에 'targetDecks' 저장 중 에러 발생:", error);
    }
  }, [targetDecks]); // targetDecks가 변경될 때마다 실행

  // 3. 검색 입력 핸들러 (스로틀링 적용)
  const handleSearchChange = useCallback((event: any) => {
    const value = event.target.value;
    setSearchInput(value); // UI 입력 값은 즉시 업데이트

    // 이전 타이머가 있으면 취소
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
    }

    // 새 타이머 설정
    throttleTimeoutRef.current = setTimeout(() => {
      // 지정된 지연 시간 후, 실제로 필터링에 사용할 검색어 업데이트
      setSearchTerm(value.toLowerCase());
    }, THROTTLE_DELAY);
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  // 4. 필터링된 덱 목록 계산 (searchTerm 변경 시에만 다시 계산)
  const filteredDecks = useMemo(() => {
    if (!searchTerm) {
      return decks;
    }

    return decks.filter((deck) =>
      deck.deckPath.toLowerCase().includes(searchTerm)
    );
  }, [decks, searchTerm]);

  // 5. 스터디 토글 핸들러
  const handleToggleStudy = useCallback(
    (deckName: string) => {
      const isStudying = targetDecks.includes(deckName);

      if (isStudying) {
        // 제거
        setTargetDecks((prevSettings) =>
          prevSettings.filter((item) => item !== deckName)
        );
      } else {
        // 추가
        setTargetDecks((prevSettings) => [...prevSettings, deckName]);
      }
    },
    [targetDecks]
  );

  // targetDecks에 deckName이 포함되어 있는지 확인하는 함수 (코드 중복 최소화)
  const isDeckStudying = (deckName: string) => targetDecks.includes(deckName);

  // 로딩 UI
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-indigo-700">덱 목록을 불러오는 중...</p>
      </div>
    );
  }

  // @TODO Delete
  const firstCardInfo = studyCardInfos.length > 0 ? studyCardInfos[0] : null;

  // 렌더링
  return (
    <div>
      {firstCardInfo && (
        <div className="anki-card-container">
          {/* Question 섹션 */}
          <div className="anki-card-question">
            <h2>질문</h2>
            <AnkiCardParse htmlContent={firstCardInfo.question} />
          </div>
          <p>-------------------------------------</p>
          {/* Answer 섹션 (보통 토글 등으로 숨김 처리) */}
          <div className="anki-card-answer">
            <h2>답변</h2>
            <AnkiCardParse htmlContent={firstCardInfo.answer} />
          </div>
        </div>
      )}
      {/* 현재 스터디 설정 상태 (디버깅/확인용) */}
      <div className="border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          현재 선택된 스터디 덱:
        </h2>
        <div className="flex flex-wrap gap-2">
          {targetDecks.length > 0 ? (
            targetDecks.map((deckName) => (
              <span
                key={deckName}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full shadow-sm"
              >
                {deckName}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              현재 스터디할 덱이 선택되지 않았습니다.
            </p>
          )}
        </div>
      </div>

      <hr className="my-6" />

      {/* 1. 검색창 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="덱 이름 검색..."
          value={searchInput}
          onChange={handleSearchChange}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-sm"
          aria-label="덱 검색 입력창"
        />
      </div>

      {decks.length === 0 && !isLoading ? (
        <p className="text-gray-500 text-center py-10">
          Anki에서 덱을 찾을 수 없습니다.
        </p>
      ) : (
        /* 2. 필터링된 덱 리스트 */
        <div className="space-y-3">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck) => {
              const isStudying = isDeckStudying(deck.deckPath);

              return (
                <div key={deck.id}>
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-gray-100">
                    {/* 스터디 토글 버튼 */}
                    <button
                      onClick={() => handleToggleStudy(deck.deckPath)}
                      className={`
                      p-2 mr-4 rounded-full transition duration-200 flex-shrink-0
                      ${
                        isStudying
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-inner"
                      }
                    `}
                      aria-label={`${deck} 스터디 ${
                        isStudying ? "비활성화" : "활성화"
                      } 토글`}
                    >
                      {isStudying ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      )}
                    </button>

                    {/* 덱 이름 */}
                    <p className="flex-grow text-lg font-medium text-gray-800 break-words">
                      {deck.deckPath}
                      <span
                        className={`
                        ml-3 text-xs font-semibold px-2 py-0.5 rounded-full
                        ${
                          isStudying
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                    `}
                      >
                        {isStudying ? "STUDY" : "SKIP"}
                      </span>
                    </p>

                    {/* 기본덱은 제외 */}
                    {deck.stats && (
                      <p>{`new (${deck.stats.new_count})   learn (${deck.stats.learn_count})   review (${deck.stats.review_count})`}</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">
              검색 결과가 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
