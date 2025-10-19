import { YankiConnect } from "yanki-connect";

// 검색 스로틀링 지연 시간 (밀리초)
const THROTTLE_DELAY = 300;

const client = new YankiConnect();

export const DeckSetting = () => {
  const [decks, setDecks] = useState<string[]>([]);

  // 현재 검색어
  const [searchInput, setSearchInput] = useState("");

  // 실제로 필터링에 사용되는 검색어 (스로틀링 적용 후 업데이트됨)
  const [searchTerm, setSearchTerm] = useState("");

  // 덱별 스터디 설정 { [deckName: string]: boolean }
  const [targetDecks, setTargetDecks] = useState<string[]>([]);

  // 스로틀링 타이머 관리를 위한 Ref
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 1. 초기 덱 목록 로드
  useEffect(() => {
    setIsLoading(true);

    client.deck
      .deckNames()
      .then((result) => {
        setDecks(result);
      })
      .catch((error) => {
        console.error("AnkiConnect error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 2. 검색 입력 핸들러 (스로틀링 적용)
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

  // 3. 필터링된 덱 목록 계산 (searchTerm 변경 시에만 다시 계산)
  const filteredDecks = useMemo(() => {
    if (!searchTerm) {
      return decks;
    }

    return decks.filter((deck) => deck.toLowerCase().includes(searchTerm));
  }, [decks, searchTerm]);

  // 4. 스터디 토글 핸들러
  const handleToggleStudy = useCallback(
    (deckName: string) => {
      const isStudying = (() => {
        if (!targetDecks) {
          return false;
        }

        if (targetDecks.length === 0) {
          return false;
        }

        const matched = !!targetDecks.find((item) => item === deckName);

        return matched;
      })();

      if (isStudying) {
        setTargetDecks((prevSettings) =>
          prevSettings.filter((item) => item !== deckName)
        );
      } else {
        setTargetDecks((prevSettings) => [...prevSettings, deckName]);
      }
    },
    [targetDecks]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-indigo-700">덱 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* 현재 스터디 설정 상태 (디버깅/확인용) */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          현재 선택된 스터디 덱:
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* {Object.entries(targetDecks)
            .filter(([, isStudying]) => isStudying)
            .map(([deckName]) => (
              <span
                key={deckName}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full shadow-sm"
              >
                {deckName}
              </span>
            ))} */}
        </div>
        {/* {Object.keys(targetDecks).length > 0 &&
          Object.values(targetDecks).every((setting) => !setting) && (
            <p className="text-gray-500 text-sm">
              현재 스터디할 덱이 선택되지 않았습니다.
            </p>
          )} */}
      </div>

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
            filteredDecks.map((deckName) => {
              const isStudying = (() => {
                if (!targetDecks) {
                  return false;
                }

                if (targetDecks.length === 0) {
                  return false;
                }

                const matched = !!targetDecks.find((item) => item === deckName);

                return matched;
              })();

              return (
                <div
                  key={deckName}
                  className="flex items-center justify-between bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-gray-100"
                >
                  {/* 스터디 토글 버튼 */}
                  <button
                    onClick={() => handleToggleStudy(deckName)}
                    className={`
                      p-2 mr-4 rounded-full transition duration-200 flex-shrink-0
                      ${
                        isStudying
                          ? "bg-green-500 text-white hover:bg-green-600 shadow-md"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-inner"
                      }
                    `}
                    aria-label={`${deckName} 스터디 ${
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
                    {deckName}
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
