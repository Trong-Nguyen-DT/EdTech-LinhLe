import { KnowledgeLesson } from '../types';

export const KNOWLEDGE_BASE: KnowledgeLesson[] = [
  // ==========================================
  // TOÁN 6
  // ==========================================
  {
    id: 'k6-c1-b1',
    grade: 'Toán 6',
    chapter: 'Chương 1: Tập hợp các số tự nhiên',
    chapterNumber: 1,
    lessonNumber: 1,
    title: 'Thứ Tự Thực Hiện Phép Tính & Dấu Hiệu Chia Hết',
    category: 'Số học & Đại số',
    readingTimeMinutes: 5,
    examRelevance: 'Chắc chắn có trong câu 1-2 của đề thi Giữa kì 1 và Cuối kì 1',
    coreTheory: [
      'Biểu thức không có dấu ngoặc: Lũy thừa → Nhân và chia → Cộng và trừ (từ trái sang phải).',
      'Biểu thức có dấu ngoặc: Tính trong ngoặc tròn ( ) trước → ngoặc vuông [ ] → ngoặc nhọn { } sau.',
      'Dấu hiệu chia hết cho 2 và 5: Nhìn chữ số tận cùng (chia hết cho 2: 0, 2, 4, 6, 8; chia hết cho 5: 0 hoặc 5).',
      'Dấu hiệu chia hết cho 3 và 9: Tính tổng các chữ số của số đó (Tổng chia hết cho 3 thì chia hết cho 3; Tổng chia hết cho 9 thì chia hết cho 9).'
    ],
    goldenFormulas: [
      {
        title: 'Quy tắc ngoặc',
        formula: '( ) ➔ [ ] ➔ { }',
        note: 'Luôn tính từ trong ra ngoài',
        highlight: true
      },
      {
        title: 'Lũy thừa cùng cơ số',
        formula: 'a^m · a^n = a^(m+n) | a^m : a^n = a^(m-n) (a ≠ 0, m ≥ n)',
        note: 'Cùng cơ số: nhân cộng số mũ, chia trừ số mũ'
      },
      {
        title: 'Tính chất phân phối',
        formula: 'a · b + a · c = a · (b + c)',
        note: 'Dùng để tính nhanh, đặt thừa số chung'
      }
    ],
    problemTypes: [
      {
        name: 'Dạng 1: Tính giá trị biểu thức bằng cách hợp lý (Tính nhanh)',
        method: 'Bước 1: Quan sát xem có thừa số chung hay các cặp số có tổng/tích tròn chục, tròn trăm không.\nBước 2: Sử dụng tính chất giao hoán, kết hợp hoặc phân phối a·(b + c) để gom nhóm.\nBước 3: Thực hiện phép tính đơn giản còn lại.',
        example: {
          problem: 'Tính nhanh: A = 47 · 135 + 47 · 65 - 47 · 100',
          solution: 'A = 47 · (135 + 65 - 100)\nA = 47 · (200 - 100)\nA = 47 · 100 = 4700',
          tips: 'Luôn đặt thừa số chung ra ngoài trước khi nhân'
        }
      },
      {
        name: 'Dạng 2: Tìm chữ số để số thỏa mãn dấu hiệu chia hết',
        method: 'Bước 1: Ưu tiên xét dấu hiệu chữ số tận cùng (chia hết cho 2, 5) để thu hẹp giá trị của chữ số hàng đơn vị.\nBước 2: Dùng dấu hiệu tổng các chữ số (chia hết cho 3, 9) để tìm chữ số còn lại.',
        example: {
          problem: 'Tìm chữ số x, y để số 12x4y chia hết cho cả 2, 5 và 9.',
          solution: 'Vì 12x4y chia hết cho cả 2 và 5 nên chữ số tận cùng y = 0.\nSố cần tìm có dạng 12x40.\nĐể 12x40 chia hết cho 9 thì (1 + 2 + x + 4 + 0) ⋮ 9 ➔ (7 + x) ⋮ 9.\nVì x là chữ số (0 ≤ x ≤ 9) nên x = 2.\nVậy số đó là 12240 (x = 2, y = 0).',
          tips: 'Xét tận cùng trước, xét tổng chữ số sau.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Thực hiện phép cộng/trừ trước phép nhân/chia khi biểu thức không có ngoặc (VD: 10 + 2 · 3 = 12 · 3 = 36).',
        correction: 'Phải nhân chia trước: 10 + 2 · 3 = 10 + 6 = 16.',
        explanation: 'Thứ tự ưu tiên: Lũy thừa ➔ Nhân/Chia ➔ Cộng/Trừ.'
      },
      {
        mistake: 'Nhầm lẫn giữa dấu hiệu chia hết cho 3 với chia hết cho 9.',
        correction: 'Số chia hết cho 9 thì chắc chắn chia hết cho 3, nhưng số chia hết cho 3 CHƯA CHẮC chia hết cho 9 (VD: số 12 chia hết cho 3 nhưng không chia hết cho 9).',
        explanation: '9 là bội của 3, nên điều kiện chia hết cho 9 khắt khe hơn.'
      }
    ],
    miniQuiz: [
      {
        question: 'Giá trị của biểu thức 18 - 8 : 2 + 3 · 2² là:',
        options: ['17', '26', '24', '32'],
        correctAnswer: 1,
        explanation: 'Ta tính: 18 - 8 : 2 + 3 · 4 = 18 - 4 + 12 = 14 + 12 = 26.'
      },
      {
        question: 'Trong các số sau, số nào vừa chia hết cho 3 vừa chia hết cho 5?',
        options: ['123', '245', '345', '560'],
        correctAnswer: 2,
        explanation: '345 có tận cùng là 5 nên chia hết cho 5. Tổng chữ số: 3 + 4 + 5 = 12 chia hết cho 3.'
      },
      {
        question: 'Viết tích 5³ · 5⁴ dưới dạng một lũy thừa là:',
        options: ['5¹²', '25⁷', '5⁷', '10⁷'],
        correctAnswer: 2,
        explanation: 'Áp dụng công thức a^m · a^n = a^(m+n), ta có 5³ · 5⁴ = 5^(3+4) = 5⁷.'
      }
    ]
  },
  {
    id: 'k6-c1-b2',
    grade: 'Toán 6',
    chapter: 'Chương 1: Tập hợp các số tự nhiên',
    chapterNumber: 1,
    lessonNumber: 2,
    title: 'Ước Chung Lớn Nhất (ƯCLN) & Bội Chung Nhỏ Nhất (BCNN)',
    category: 'Số học & Đại số',
    readingTimeMinutes: 6,
    examRelevance: 'Bài toán thực tế chia tổ, chia quà, chu kì lặp lại trong đề thi',
    coreTheory: [
      'Ước chung lớn nhất của hai hay nhiều số là số lớn nhất trong tập hợp các ước chung của các số đó.',
      'Bội chung nhỏ nhất của hai hay nhiều số là số nhỏ nhất khác 0 trong tập hợp các bội chung của các số đó.',
      'Hai số nguyên tố cùng nhau là hai số có ƯCLN bằng 1 (Ví dụ: 8 và 9 là hai số nguyên tố cùng nhau dù cả hai đều là hợp số).',
      'Mối liên hệ đặc biệt: Với hai số a và b, ta luôn có: ƯCLN(a, b) · BCNN(a, b) = a · b.'
    ],
    goldenFormulas: [
      {
        title: 'Cách tìm ƯCLN',
        formula: 'ƯCLN = Tích các thừa số nguyên tố CHUNG với số mũ NHỎ NHẤT',
        note: 'Chung - Số mũ nhỏ nhất',
        highlight: true
      },
      {
        title: 'Cách tìm BCNN',
        formula: 'BCNN = Tích các thừa số nguyên tố CHUNG & RIÊNG với số mũ LỚN NHẤT',
        note: 'Chung và Riêng - Số mũ lớn nhất',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán thực tế: Chia quà, xếp đội ngũ thành nhiều phần nhất',
        method: 'Khi đề bài yêu cầu: "chia thành nhiều phần nhất, mỗi phần có số lượng đồ vật bằng nhau" ➔ Dạng toán tìm ƯCLN.',
        example: {
          problem: 'Một lớp học có 24 nam và 18 nữ. Cô giáo muốn chia đều số học sinh vào các tổ sao cho số nam và số nữ ở mỗi tổ là như nhau. Hỏi có thể chia được nhiều nhất bao nhiêu tổ?',
          solution: 'Gọi số tổ nhiều nhất có thể chia là x (tổ, x ∈ N*).\nTheo đề bài, 24 ⋮ x và 18 ⋮ x, mà x lớn nhất nên x = ƯCLN(24, 18).\nTa có: 24 = 2³ · 3; 18 = 2 · 3².\nƯCLN(24, 18) = 2 · 3 = 6.\nVậy cô giáo có thể chia thành nhiều nhất 6 tổ (mỗi tổ gồm 4 nam và 3 nữ).',
          tips: 'Cụm từ "nhiều nhất", "chia đều" báo hiệu tìm ƯCLN.'
        }
      },
      {
        name: 'Dạng toán thực tế: Chu kì lặp lại cùng lúc (Hai chuông, hai xe khởi hành)',
        method: 'Khi đề bài yêu cầu: "sau bao nhiêu phút hai xe lại cùng xuất phát / hai chuông lại cùng reo lần tiếp theo" ➔ Dạng toán tìm BCNN.',
        example: {
          problem: 'Hai bạn An và Bình cùng trực nhật một ngày. Cứ sau 6 ngày An trực một lần, sau 8 ngày Bình trực một lần. Hỏi sau ít nhất bao nhiêu ngày hai bạn lại cùng trực nhật?',
          solution: 'Số ngày ít nhất để hai bạn cùng trực nhật chính là BCNN(6, 8).\nTa có: 6 = 2 · 3; 8 = 2³.\nBCNN(6, 8) = 2³ · 3 = 24.\nVậy sau ít nhất 24 ngày thì hai bạn lại cùng trực nhật.',
          tips: 'Cụm từ "ít nhất", "cùng một lúc lần kế tiếp" báo hiệu tìm BCNN.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Chọn nhầm số mũ lớn nhất khi tìm ƯCLN.',
        correction: 'ƯCLN lấy số mũ NHỎ NHẤT của các thừa số CHUNG.',
        explanation: 'Ước phải chia hết được cho cả hai số, nếu lấy số mũ lớn sẽ không chia hết.'
      }
    ],
    miniQuiz: [
      {
        question: 'Cho a = 2² · 3 · 5 và b = 2 · 3² · 7. Khi đó ƯCLN(a, b) là:',
        options: ['6', '12', '18', '210'],
        correctAnswer: 0,
        explanation: 'Thừa số chung là 2 và 3 với số mũ nhỏ nhất là 2¹ và 3¹. Do đó ƯCLN = 2 · 3 = 6.'
      },
      {
        question: 'BCNN của hai số nguyên tố cùng nhau a và b là:',
        options: ['1', 'a + b', 'a · b', 'a : b'],
        correctAnswer: 2,
        explanation: 'Khi hai số nguyên tố cùng nhau, chúng không có thừa số nguyên tố chung nên BCNN chính bằng tích a · b.'
      }
    ]
  },
  {
    id: 'k6-c2-b1',
    grade: 'Toán 6',
    chapter: 'Chương 2: Số nguyên',
    chapterNumber: 2,
    lessonNumber: 1,
    title: 'Phép Tính Trên Tập Hợp Số Nguyên (Z) & Quy Tắc Dấu Ngoặc',
    category: 'Số học & Đại số',
    readingTimeMinutes: 5,
    examRelevance: 'Nền tảng quan trọng xuyên suốt cấp 2, thường chiếm 2 điểm trong đề thi',
    coreTheory: [
      'Tập hợp số nguyên Z gồm các số nguyên âm, số 0 và các số nguyên dương: Z = {..., -3, -2, -1, 0, 1, 2, 3, ...}.',
      'Cộng hai số nguyên cùng dấu: Cộng phần tự nhiên rồi đặt dấu chung phía trước.',
      'Cộng hai số nguyên khác dấu: Lấy số lớn trừ số bé (theo giá trị tuyệt đối) rồi đặt dấu của số có giá trị tuyệt đối lớn hơn.',
      'Nhân, chia hai số nguyên: Cùng dấu ra DƯƠNG (+), khác dấu ra ÂM (-).',
      'Quy tắc dấu ngoặc: Đằng trước dấu ngoặc có dấu "+" giữ nguyên dấu các số hạng trong ngoặc; Đằng trước có dấu "-" phải ĐỔI DẤU tất cả các số hạng trong ngoặc.'
    ],
    goldenFormulas: [
      {
        title: 'Quy tắc dấu trong phép nhân/chia',
        formula: '(+) · (+) = (+);  (-) · (-) = (+);  (+) · (-) = (-);  (-) · (+) = (-)',
        note: 'Cùng dấu thành Dương (+), khác dấu thành Âm (-)',
        highlight: true
      },
      {
        title: 'Quy tắc đổi dấu khi mở ngoặc',
        formula: '-(a - b + c) = -a + b - c',
        note: 'Dấu trừ phía trước làm đảo toàn bộ dấu bên trong!',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng 1: Tính giá trị biểu thức và phá ngoặc thông minh',
        method: 'Khi trước ngoặc có dấu trừ, hãy đổi dấu từng số bên trong rồi tìm các cặp số đối nhau (có tổng bằng 0) để triệt tiêu.',
        example: {
          problem: 'Tính: P = (2025 - 45) - (2025 + 55)',
          solution: 'P = 2025 - 45 - 2025 - 55\nP = (2025 - 2025) - (45 + 55)\nP = 0 - 100 = -100',
          tips: 'Phá ngoặc trước để nhận ra các số triệt tiêu nhau, không vội tính trong ngoặc.'
        }
      },
      {
        name: 'Dạng 2: Tìm x nguyên (Quy tắc chuyển vế)',
        method: 'Khi chuyển một số hạng từ vế này sang vế kia của một đẳng thức, ta phải đổi dấu số hạng đó: "+" đổi thành "-", "-" đổi thành "+".',
        example: {
          problem: 'Tìm x biết: 15 - (x + 2) = -10',
          solution: '15 - x - 2 = -10\n13 - x = -10\n-x = -10 - 13\n-x = -23 ➔ x = 23',
          tips: 'Coi (x + 2) là số trừ hoặc phá ngoặc cẩn thận.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Phá ngoặc có dấu trừ đằng trước nhưng chỉ đổi dấu số hạng đầu tiên, quên đổi dấu các số hạng phía sau: -(a - b) = -a - b (SAI).',
        correction: 'Đúng phải là: -(a - b) = -a + b.',
        explanation: 'Dấu trừ áp dụng lên toàn bộ các số hạng trong ngoặc.'
      }
    ],
    miniQuiz: [
      {
        question: 'Kết quả của phép tính (-15) + (-25) là:',
        options: ['-40', '40', '-10', '10'],
        correctAnswer: 0,
        explanation: 'Cộng hai số nguyên âm: giữ nguyên dấu âm và cộng hai giá trị tự nhiên: -(15 + 25) = -40.'
      },
      {
        question: 'Tính: (-4) · (-5) · (-2) = ?',
        options: ['40', '-40', '20', '-20'],
        correctAnswer: 1,
        explanation: 'Tích có 3 thừa số âm (số lẻ thừa số âm) nên kết quả mang dấu âm: -(4 · 5 · 2) = -40.'
      }
    ]
  },
  {
    id: 'k6-c3-b1',
    grade: 'Toán 6',
    chapter: 'Chương 3: Hình học trực quan',
    chapterNumber: 3,
    lessonNumber: 1,
    title: 'Hình Vuông, Tam Giác Đều, Hình Chữ Nhật, Hình Thoi & Chu Vi, Diện Tích',
    category: 'Hình học & Đo lường',
    readingTimeMinutes: 5,
    examRelevance: 'Câu vẽ hình & bài toán tính diện tích lát gạch/làm vườn thực tế',
    coreTheory: [
      'Tam giác đều: 3 cạnh bằng nhau, 3 góc bằng nhau và bằng 60°.',
      'Hình vuông: 4 cạnh bằng nhau, 4 góc vuông, hai đường chéo bằng nhau và vuông góc tại trung điểm.',
      'Hình chữ nhật: 4 góc vuông, 2 cạnh đối song song và bằng nhau, 2 đường chéo bằng nhau.',
      'Hình thoi: 4 cạnh bằng nhau, 2 đường chéo vuông góc với nhau tại trung điểm của mỗi đường.',
      'Hình bình hành: Các cạnh đối song song và bằng nhau, các góc đối bằng nhau.'
    ],
    goldenFormulas: [
      {
        title: 'Diện tích Hình chữ nhật',
        formula: 'S = a · b (với a là chiều dài, b là chiều rộng)',
        note: 'Chu vi C = (a + b) · 2'
      },
      {
        title: 'Diện tích Hình vuông',
        formula: 'S = a² (với a là độ dài cạnh)',
        note: 'Chu vi C = 4 · a'
      },
      {
        title: 'Diện tích Hình thoi',
        formula: 'S = (d1 · d2) / 2',
        note: 'Nửa tích hai đường chéo d1, d2',
        highlight: true
      },
      {
        title: 'Diện tích Hình bình hành',
        formula: 'S = a · h (với a là cạnh đáy, h là chiều cao tương ứng)',
        note: 'Đáy nhân chiều cao'
      }
    ],
    problemTypes: [
      {
        name: 'Bài toán thực tế: Tính số viên gạch lát sàn nhà',
        method: 'Bước 1: Đổi tất cả các kích thước về cùng một đơn vị (thường là mét hoặc cm/dm).\nBước 2: Tính diện tích căn phòng (S_phòng).\nBước 3: Tính diện tích một viên gạch (S_gạch).\nBước 4: Số viên gạch = S_phòng : S_gạch.',
        example: {
          problem: 'Một căn phòng hình chữ nhật dài 8m, rộng 6m. Người ta dùng các viên gạch hình vuông cạnh 40cm để lát nền. Hỏi cần bao nhiêu viên gạch (bỏ qua mép vữa)?',
          solution: 'Diện tích nền nhà: S_phòng = 8 · 6 = 48 m² = 480 000 cm².\nDiện tích 1 viên gạch: S_gạch = 40 · 40 = 1600 cm².\nSố viên gạch cần dùng: 480 000 : 1600 = 300 (viên).',
          tips: 'Lỗi sai phổ biến nhất là quên đổi đơn vị giữa mét và centimet!'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Quên chia cho 2 khi tính diện tích hình thoi: S = d1 · d2 (SAI).',
        correction: 'Đúng là S = (d1 · d2) / 2.',
        explanation: 'Diện tích hình thoi bằng một nửa tích độ dài hai đường chéo.'
      }
    ],
    miniQuiz: [
      {
        question: 'Một hình thoi có độ dài hai đường chéo là 8cm và 10cm. Diện tích hình thoi là:',
        options: ['80 cm²', '40 cm²', '36 cm²', '20 cm²'],
        correctAnswer: 1,
        explanation: 'S = (8 · 10) / 2 = 40 cm².'
      }
    ]
  },

  // ==========================================
  // TOÁN 7
  // ==========================================
  {
    id: 'k7-c1-b1',
    grade: 'Toán 7',
    chapter: 'Chương 1: Số hữu tỉ & Số thực',
    chapterNumber: 1,
    lessonNumber: 1,
    title: 'Số Hữu Tỉ, Lũy Thừa & Thứ Tự Thực Hiện Phép Tính',
    category: 'Số học & Đại số',
    readingTimeMinutes: 5,
    examRelevance: 'Câu 1 trong đề thi khảo sát chất lượng đầu năm và Giữa kì 1',
    coreTheory: [
      'Số hữu tỉ là số viết được dưới dạng phân số a/b với a, b ∈ Z, b ≠ 0. Kí hiệu tập hợp là Q.',
      'Lũy thừa của một số hữu tỉ: (x/y)^n = x^n / y^n.',
      'Lũy thừa của lũy thừa: (x^m)^n = x^(m · n).',
      'Lũy thừa của một tích / thương: (x · y)^n = x^n · y^n; (x / y)^n = x^n / y^n (y ≠ 0).',
      'Quy ước quan trọng: x⁰ = 1 (với mọi x ≠ 0); x¹ = x.'
    ],
    goldenFormulas: [
      {
        title: 'Công thức lũy thừa cơ bản',
        formula: 'x^m · x^n = x^(m+n) | x^m : x^n = x^(m-n) | (x^m)^n = x^(m · n)',
        note: 'Cùng cơ số: nhân cộng mũ, chia trừ mũ, lũy thừa chồng nhân mũ',
        highlight: true
      },
      {
        title: 'Đưa về cùng cơ số để tìm x',
        formula: 'Nếu a^f(x) = a^g(x) (với a ≠ 0, a ≠ ±1) thì f(x) = g(x)',
        note: 'Phương pháp vàng giải toán tìm x chứa số mũ'
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán: Tìm x ở số mũ',
        method: 'Bước 1: Biến đổi hai vế về cùng một cơ số cơ bản (thường là 2, 3, 5,...).\nBước 2: Cho hai số mũ bằng nhau.\nBước 3: Giải tìm x.',
        example: {
          problem: 'Tìm x biết: 3^(x + 1) = 81',
          solution: 'Ta có: 81 = 3⁴.\nPhương trình trở thành: 3^(x + 1) = 3⁴.\nDo đó: x + 1 = 4 ➔ x = 3.\nVậy x = 3.',
          tips: 'Hãy ghi nhớ bảng lũy thừa cơ bản: 2²..2¹⁰, 3²..3⁵, 5²..5⁴.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Nhầm lẫn giữa (x^m)^n với x^(m^n). Ví dụ: (2²)³ = 2⁶ nhưng 2^(2³) = 2⁸ = 256.',
        correction: '(a^m)^n = a^(m · n).',
        explanation: 'Lũy thừa của lũy thừa thì nhân hai số mũ lại với nhau.'
      }
    ],
    miniQuiz: [
      {
        question: 'Giá trị của biểu thức (-1/2)³ là:',
        options: ['1/8', '-1/8', '-1/6', '1/6'],
        correctAnswer: 1,
        explanation: '(-1/2)³ = (-1)³ / 2³ = -1/8 (số âm mũ lẻ cho kết quả âm).'
      },
      {
        question: 'Cho 2^x = 16. Giá trị của x là:',
        options: ['2', '3', '4', '8'],
        correctAnswer: 2,
        explanation: '16 = 2⁴, do đó 2^x = 2⁴ ➔ x = 4.'
      }
    ]
  },
  {
    id: 'k7-c2-b1',
    grade: 'Toán 7',
    chapter: 'Chương 2: Tỉ lệ thức và Đại lượng tỉ lệ',
    chapterNumber: 2,
    lessonNumber: 1,
    title: 'Tỉ Lệ Thức & Tính Chất Dãy Tỉ Số Bằng Nhau',
    category: 'Số học & Đại số',
    readingTimeMinutes: 6,
    examRelevance: 'Bài toán chia phần, tỉ lệ học sinh các lớp (1,5 - 2,0 điểm thi HK1)',
    coreTheory: [
      'Tỉ lệ thức là đẳng thức của hai tỉ số: a/b = c/d (hoặc a : b = c : d).',
      'Tính chất cơ bản: a/b = c/d ⇔ a · d = b · c (Tích ngoại tỉ bằng tích trung tỉ).',
      'Tính chất dãy tỉ số bằng nhau: Từ a/b = c/d = e/f suy ra = (a + c + e)/(b + d + f) = (a - c + e)/(b - d + f).'
    ],
    goldenFormulas: [
      {
        title: 'Dãy tỉ số bằng nhau',
        formula: 'a/b = c/d = e/f = (a + c + e) / (b + d + f) = (a - c + e) / (b - d + f)',
        note: 'Dấu ở tử và mẫu phải hoàn toàn tương ứng nhau!',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán thực tế: Chia theo tỉ lệ',
        method: 'Bước 1: Gọi các đại lượng cần tìm là x, y, z (đặt điều kiện phù hợp).\nBước 2: Lập tỉ số từ đề bài: x/a = y/b = z/c.\nBước 3: Lập mối liên hệ tổng hoặc hiệu: x + y + z = S hoặc x - y = D.\nBước 4: Áp dụng tính chất dãy tỉ số bằng nhau để tìm x, y, z.',
        example: {
          problem: 'Ba lớp 7A, 7B, 7C quyên góp được 120 quyển vở. Biết số vở của ba lớp tỉ lệ với 4; 5; 6. Tính số vở mỗi lớp.',
          solution: 'Gọi số vở của 7A, 7B, 7C lần lượt là x, y, z (quyển, x, y, z ∈ N*).\nTa có: x/4 = y/5 = z/6 và x + y + z = 120.\nÁp dụng tính chất dãy tỉ số bằng nhau:\nx/4 = y/5 = z/6 = (x + y + z) / (4 + 5 + 6) = 120 / 15 = 8.\nDo đó: x = 8 · 4 = 32; y = 8 · 5 = 40; z = 8 · 6 = 48.\nVậy 7A góp 32 quyển, 7B góp 40 quyển, 7C góp 48 quyển.',
          tips: 'Kiểm tra lại: 32 + 40 + 48 = 120 (chuẩn xác).'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Tử cộng nhưng mẫu lại trừ hoặc nhân mẫu với nhau: (a+c)/(b·d) (SAI).',
        correction: 'Tử thực hiện phép tính nào (+ hoặc -) thì mẫu phải thực hiện đúng phép tính đó.',
        explanation: 'Quy tắc dãy tỉ số bảo toàn tỉ lệ cộng trừ trực tiếp.'
      }
    ],
    miniQuiz: [
      {
        question: 'Nếu x/3 = y/5 và x + y = 32 thì x bằng:',
        options: ['12', '20', '15', '16'],
        correctAnswer: 0,
        explanation: 'x/3 = y/5 = (x + y)/(3 + 5) = 32/8 = 4. Suy ra x = 4 · 3 = 12.'
      }
    ]
  },
  {
    id: 'k7-c3-b1',
    grade: 'Toán 7',
    chapter: 'Chương 3: Hình học tam giác',
    chapterNumber: 3,
    lessonNumber: 1,
    title: 'Ba Trường Hợp Bằng Nhau Của Tam Giác (c-c-c, c-g-c, g-c-g) & Tam Giác Cân',
    category: 'Hình học & Đo lường',
    readingTimeMinutes: 7,
    examRelevance: 'Xương sống của Hình học THCS, luôn là câu hình tự luận lớn nhất (3 điểm)',
    coreTheory: [
      'Tổng ba góc trong một tam giác luôn bằng 180°: ∠A + ∠B + ∠C = 180°.',
      'Trường hợp 1 (Cạnh - Cạnh - Cạnh, c-c-c): Ba cạnh của tam giác này bằng ba cạnh của tam giác kia.',
      'Trường hợp 2 (Cạnh - Góc - Cạnh, c-g-c): Hai cạnh và GÓC XEN GIỮA của tam giác này bằng hai cạnh và góc xen giữa của tam giác kia.',
      'Trường hợp 3 (Góc - Cạnh - Góc, g-c-g): Một cạnh và HAI GÓC KỀ của tam giác này bằng một cạnh và hai góc kề của tam giác kia.',
      'Tam giác cân: Có 2 cạnh bằng nhau ⇔ Có 2 góc ở đáy bằng nhau.',
      'Định lý góc ngoài: Góc ngoài của tam giác bằng tổng hai góc trong không kề với nó.'
    ],
    goldenFormulas: [
      {
        title: 'Góc ở đáy tam giác cân',
        formula: '∠B = ∠C = (180° - ∠A) / 2 (tam giác ABC cân tại A)',
        note: 'Biết góc ở đỉnh tính được ngay 2 góc ở đáy',
        highlight: true
      },
      {
        title: 'Tam giác đều',
        formula: 'AB = BC = CA ⇔ ∠A = ∠B = ∠C = 60°',
        note: 'Mọi tam giác đều đều có các góc bằng 60°'
      }
    ],
    problemTypes: [
      {
        name: 'Chứng minh hai đoạn thẳng hoặc hai góc bằng nhau',
        method: 'Bước 1: Tìm hai tam giác chứa hai đoạn thẳng hoặc hai góc cần chứng minh.\nBước 2: Tìm 3 yếu tố bằng nhau (c-c-c, c-g-c hoặc g-c-g).\nBước 3: Kết luận hai tam giác bằng nhau ➔ Suy ra các cạnh/góc tương ứng bằng nhau.',
        example: {
          problem: 'Cho tam giác ABC có AB = AC. Gọi M là trung điểm của BC. Chứng minh AM vuông góc với BC.',
          solution: 'Xét ΔABM và ΔACM có:\n- AB = AC (giả thiết)\n- BM = MC (M là trung điểm BC)\n- AM là cạnh chung\n➔ ΔABM = ΔACM (c-c-c).\nSuy ra ∠AMB = ∠AMC (hai góc tương ứng).\nMà ∠AMB + ∠AMC = 180° (hai góc kề bù),\nNên ∠AMB = ∠AMC = 180° / 2 = 90°.\nVậy AM ⊥ BC.',
          tips: 'Khi có trung điểm, luôn chú ý cạnh chung và hai đoạn nhỏ bằng nhau.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Dùng trường hợp Cạnh - Góc - Cạnh nhưng góc không xen giữa hai cạnh (SAI nghiêm trọng).',
        correction: 'Góc phải nằm giữa hai cạnh đã cho bằng nhau (được kẹp bởi 2 cạnh đó).',
        explanation: 'Nếu góc không xen giữa, hai tam giác chưa chắc bằng nhau.'
      }
    ],
    miniQuiz: [
      {
        question: 'Cho tam giác ABC cân tại A có góc A = 50°. Số đo góc B là:',
        options: ['50°', '65°', '130°', '60°'],
        correctAnswer: 1,
        explanation: 'Tam giác cân tại A có ∠B = ∠C = (180° - 50°) / 2 = 130° / 2 = 65°.'
      }
    ]
  },

  // ==========================================
  // TOÁN 8
  // ==========================================
  {
    id: 'k8-c1-b1',
    grade: 'Toán 8',
    chapter: 'Chương 1 & 2: Đa thức & Hằng đẳng thức',
    chapterNumber: 1,
    lessonNumber: 1,
    title: '7 Hằng Đẳng Thức Đáng Nhớ & Phân Tích Đa Thức Thành Nhân Tử',
    category: 'Số học & Đại số',
    readingTimeMinutes: 7,
    examRelevance: 'Bắt buộc phải thuộc lòng! Chiếm 30% điểm bài đại số lớp 8 và thi vào 10',
    coreTheory: [
      '1. Bình phương của một tổng: (A + B)² = A² + 2AB + B²',
      '2. Bình phương của một hiệu: (A - B)² = A² - 2AB + B²',
      '3. Hiệu hai bình phương: A² - B² = (A - B)(A + B)',
      '4. Lập phương của một tổng: (A + B)³ = A³ + 3A²B + 3AB² + B³',
      '5. Lập phương của một hiệu: (A - B)³ = A³ - 3A²B + 3AB² - B³',
      '6. Tổng hai lập phương: A³ + B³ = (A + B)(A² - AB + B²)',
      '7. Hiệu hai lập phương: A³ - B³ = (A - B)(A² + AB + B²)',
      'Các phương pháp phân tích nhân tử: 1) Đặt nhân tử chung, 2) Dùng hằng đẳng thức, 3) Nhóm hạng tử, 4) Tách hạng tử (dùng cho tam thức bậc hai).'
    ],
    goldenFormulas: [
      {
        title: 'Bộ 3 HĐT hay dùng nhất',
        formula: '(A ± B)² = A² ± 2AB + B²  |  A² - B² = (A - B)(A + B)',
        note: 'Lưu ý dấu trừ ở giữa hiệu hai bình phương',
        highlight: true
      },
      {
        title: 'Tách hạng tử tam thức bậc hai ax² + bx + c',
        formula: 'Tìm hai số m, n sao cho: m + n = b và m · n = a · c',
        note: 'Tách bx = mx + nx rồi nhóm nhân tử chung',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng 1: Phân tích đa thức bậc hai x² + bx + c thành nhân tử',
        method: 'Bước 1: Tìm 2 số có tích bằng c và tổng bằng b.\nBước 2: Tách bx thành tổng 2 số đó.\nBước 3: Nhóm từng cặp và đặt nhân tử chung.',
        example: {
          problem: 'Phân tích đa thức thành nhân tử: P = x² - 5x + 6',
          solution: 'Ta tìm hai số có tích bằng 6 và tổng bằng -5: đó là -2 và -3.\nTách: P = x² - 2x - 3x + 6\nNhóm: P = x(x - 2) - 3(x - 2)\nNhân tử chung: P = (x - 2)(x - 3)',
          tips: 'Tích dương, tổng âm ➔ Cả 2 số đều là số âm.'
        }
      },
      {
        name: 'Dạng 2: Rút gọn biểu thức đại số',
        method: 'Bước 1: Khai triển các hằng đẳng thức cẩn thận.\nBước 2: Bỏ dấu ngoặc (chú ý dấu trừ phía trước!).\nBước 3: Thu gọn các đơn thức đồng dạng.',
        example: {
          problem: 'Rút gọn: A = (x + 3)² - (x - 2)(x + 2) - 6x',
          solution: 'Khai triển: A = (x² + 6x + 9) - (x² - 4) - 6x\nPhá ngoặc: A = x² + 6x + 9 - x² + 4 - 6x\nThu gọn: A = (x² - x²) + (6x - 6x) + (9 + 4) = 13.',
          tips: '(x - 2)(x + 2) = x² - 4, trước có dấu trừ thành -x² + 4.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Quên số 2 ở hạng tử giữa: (A + B)² = A² + B² (SAI rất phổ biến).',
        correction: '(A + B)² = A² + 2AB + B².',
        explanation: 'Nhớ câu thần chú: "Bình phương số thứ nhất + HAI LẦN TÍCH + bình phương số thứ hai".'
      },
      {
        mistake: 'Nhầm dấu trong tổng/hiệu lập phương: A³ + B³ = (A + B)(A² + AB + B²) (SAI dấu AB).',
        correction: 'A³ + B³ = (A + B)(A² - AB + B²) (bình phương thiếu của một HIỆU mang dấu trừ).',
        explanation: 'Nếu ngoặc đầu là (A + B) thì ngoặc sau là (A² - AB + B²).'
      }
    ],
    miniQuiz: [
      {
        question: 'Khai triển (2x - 3)² ta được kết quả là:',
        options: ['4x² - 9', '4x² - 6x + 9', '4x² - 12x + 9', '2x² - 12x + 9'],
        correctAnswer: 2,
        explanation: '(2x)² - 2 · (2x) · 3 + 3² = 4x² - 12x + 9.'
      },
      {
        question: 'Đa thức x² - 16 được phân tích thành nhân tử là:',
        options: ['(x - 4)²', '(x - 4)(x + 4)', '(x - 8)(x + 8)', '(x - 16)(x + 1)'],
        correctAnswer: 1,
        explanation: 'Áp dụng A² - B² = (A - B)(A + B) với A = x, B = 4.'
      }
    ]
  },
  {
    id: 'k8-c3-b1',
    grade: 'Toán 8',
    chapter: 'Chương 3: Định lí Thalès & Tam giác đồng dạng',
    chapterNumber: 3,
    lessonNumber: 1,
    title: 'Định Lí Thalès, Tính Chất Phân Giác & Tam Giác Đồng Dạng',
    category: 'Hình học & Đo lường',
    readingTimeMinutes: 7,
    examRelevance: 'Nội dung cốt lõi của đề thi Học kì 2 lớp 8 và Hình học lớp 9',
    coreTheory: [
      'Định lí Thalès thuận: Nếu một đường thẳng song song với một cạnh của tam giác và cắt hai cạnh còn lại thì nó định ra trên hai cạnh đó những đoạn thẳng tương ứng tỉ lệ: AB\' / AB = AC\' / AC.',
      'Hệ quả Thalès: Đường thẳng song song với một cạnh cắt hai cạnh còn lại tạo thành tam giác mới có ba cạnh tương ứng tỉ lệ với ba cạnh của tam giác đã cho: AB\' / AB = AC\' / AC = B\'C\' / BC.',
      'Tính chất đường phân giác: Trong tam giác, đường phân giác của một góc chia cạnh đối diện thành hai đoạn thẳng tỉ lệ với hai cạnh kề: DB / DC = AB / AC (với AD là phân giác trong).',
      'Tam giác đồng dạng: ΔA\'B\'C\' ∽ ΔABC nếu các góc tương ứng bằng nhau và các cạnh tương ứng tỉ lệ.',
      'Ba trường hợp đồng dạng: 1) c-c-c (ba cạnh tỉ lệ), 2) c-g-c (hai cạnh tỉ lệ và góc xen giữa bằng nhau), 3) g-g (hai góc bằng nhau - trường hợp phổ biến nhất!).'
    ],
    goldenFormulas: [
      {
        title: 'Tỉ số đường phân giác',
        formula: 'DB / DC = AB / AC',
        note: 'AD là tia phân giác góc A cắt BC tại D',
        highlight: true
      },
      {
        title: 'Tỉ số diện tích hai tam giác đồng dạng',
        formula: 'S_A\'B\'C\' / S_ABC = k²',
        note: 'Tỉ số diện tích bằng BÌNH PHƯƠNG tỉ số đồng dạng k!',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán: Tính độ dài đoạn thẳng nhờ phân giác',
        method: 'Bước 1: Viết tỉ số phân giác: DB / DC = AB / AC.\nBước 2: Thay số hoặc biểu diễn DB theo DC.\nBước 3: Giải phương trình tìm độ dài.',
        example: {
          problem: 'Cho ΔABC có AB = 6cm, AC = 9cm, BC = 10cm. Kẻ đường phân giác AD (D ∈ BC). Tính độ dài đoạn thẳng BD và CD.',
          solution: 'Áp dụng tính chất đường phân giác trong ΔABC:\nBD / CD = AB / AC = 6 / 9 = 2 / 3.\nSuy ra BD / 2 = CD / 3 = (BD + CD) / (2 + 3) = BC / 5 = 10 / 5 = 2.\nDo đó: BD = 2 · 2 = 4 (cm); CD = 2 · 3 = 6 (cm).',
          tips: 'Kết hợp tính chất dãy tỉ số bằng nhau giúp giải cực kì gọn gàng.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Tưởng tỉ số diện tích bằng tỉ số đồng dạng: S1 / S2 = k (SAI).',
        correction: 'Tỉ số chu vi bằng k, nhưng tỉ số diện tích PHẢI BẰNG k².',
        explanation: 'Diện tích có 2 kích thước (dài · rộng) nên tỉ số được bình phương.'
      }
    ],
    miniQuiz: [
      {
        question: 'Nếu ΔABC ∽ ΔDEF theo tỉ số k = 2/3 thì tỉ số diện tích S_ABC / S_DEF bằng:',
        options: ['2/3', '4/9', '4/6', '8/27'],
        correctAnswer: 1,
        explanation: 'Tỉ số diện tích bằng k² = (2/3)² = 4/9.'
      }
    ]
  },

  // ==========================================
  // TOÁN 9
  // ==========================================
  {
    id: 'k9-c1-b1',
    grade: 'Toán 9',
    chapter: 'Chương 1: Căn thức bậc hai',
    chapterNumber: 1,
    lessonNumber: 1,
    title: 'Căn Thức Bậc Hai, Điều Kiện Xác Định & Rút Gọn Biểu Thức',
    category: 'Số học & Đại số',
    readingTimeMinutes: 7,
    examRelevance: 'Câu I (2.0 điểm) trong 100% các đề thi tuyển sinh vào lớp 10 trên toàn quốc',
    coreTheory: [
      'Căn thức √A xác định (có nghĩa) khi và chỉ khi biểu thức dưới căn không âm: A ≥ 0.',
      'Hằng đẳng thức căn bậc hai: √(A²) = |A| = A (nếu A ≥ 0) hoặc -A (nếu A < 0).',
      'Khai phương một tích / thương: √(A · B) = √A · √B (với A ≥ 0, B ≥ 0); √(A / B) = √A / √B (với A ≥ 0, B > 0).',
      'Đưa thừa số ra ngoài / vào trong dấu căn: √(A² · B) = |A|√B.',
      'Trục căn thức ở mẫu: Dùng hằng đẳng thức liên hợp A² - B² để làm mất căn ở mẫu: c / (√a - b) = c(√a + b) / (a - b²).'
    ],
    goldenFormulas: [
      {
        title: 'Hằng đẳng thức căn bản',
        formula: '√(A²) = |A|',
        note: 'Bắt buộc phải có dấu giá trị tuyệt đối!',
        highlight: true
      },
      {
        title: 'Trục căn thức bằng lượng liên hợp',
        formula: '1 / (√a - √b) = (√a + √b) / (a - b)  (a, b ≥ 0, a ≠ b)',
        note: 'Nhân cả tử và mẫu với biểu thức liên hợp đổi dấu',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng 1: Rút gọn biểu thức căn có chứa biến',
        method: 'Bước 1: Tìm ĐKXĐ (mẫu khác 0, biểu thức trong căn ≥ 0).\nBước 2: Phân tích các mẫu thành nhân tử để tìm mẫu thức chung.\nBước 3: Quy đồng, gom tử và rút gọn các nhân tử chung với mẫu.\nBước 4: Đối chiếu ĐKXĐ và kết luận.',
        example: {
          problem: 'Rút gọn P = [ √x / (√x - 2) - 2 / (√x + 2) ] · (x - 4) / (x + 2√x) với x > 0, x ≠ 4.',
          solution: 'Mẫu chung trong ngoặc là (√x - 2)(√x + 2) = x - 4.\nP = [ √x(√x + 2) - 2(√x - 2) ] / (x - 4) · (x - 4) / [ √x(√x + 2) ]\nP = (x + 2√x - 2√x + 4) / [ √x(√x + 2) ]\nP = (x + 4) / [ √x(√x + 2) ].',
          tips: 'Luôn chú ý các hằng đẳng thức x - 4 = (√x - 2)(√x + 2) và x + 2√x = √x(√x + 2).'
        }
      },
      {
        name: 'Dạng 2: Rút gọn căn số chứa căn kép dạng √(a ± 2√b)',
        method: 'Biến đổi biểu thức trong căn về dạng bình phương (√x ± √y)² để triệt tiêu căn lớn bên ngoài.',
        example: {
          problem: 'Rút gọn: M = √(7 - 4√3)',
          solution: 'Ta phân tích: 4√3 = 2 · 2 · √3.\nKhi đó 2² + (√3)² = 4 + 3 = 7.\nDo đó: 7 - 4√3 = 2² - 2 · 2 · √3 + (√3)² = (2 - √3)².\nSuy ra M = √[ (2 - √3)² ] = |2 - √3| = 2 - √3 (do 2 > √3).',
          tips: 'Tách 2 · a · b trước rồi kiểm tra a² + b².'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: '√(A²) = A (quên giá trị tuyệt đối khi A có thể âm, VD: √((-3)²) = -3 là SAI).',
        correction: '√(A²) = |A| = |-3| = 3.',
        explanation: 'Căn bậc hai số học của một số luôn luôn không âm.'
      }
    ],
    miniQuiz: [
      {
        question: 'Điều kiện xác định của biểu thức √(3x - 6) là:',
        options: ['x > 2', 'x ≥ 2', 'x ≤ 2', 'x ≥ -2'],
        correctAnswer: 1,
        explanation: '3x - 6 ≥ 0 ⇔ 3x ≥ 6 ⇔ x ≥ 2.'
      },
      {
        question: 'Giá trị của √( (1 - √5)² ) bằng:',
        options: ['1 - √5', '√5 - 1', '4', '6'],
        correctAnswer: 1,
        explanation: '√( (1 - √5)² ) = |1 - √5|. Do 1 < √5 nên |1 - √5| = √5 - 1.'
      }
    ]
  },
  {
    id: 'k9-c2-b1',
    grade: 'Toán 9',
    chapter: 'Chương 2: Phương trình bậc hai & Hệ thức Vi-ét',
    chapterNumber: 2,
    lessonNumber: 1,
    title: 'Phương Trình Bậc Hai Một Biển, Công Thức Nghiệm & Định Lí Vi-ét',
    category: 'Số học & Đại số',
    readingTimeMinutes: 8,
    examRelevance: 'Câu phân loại then chốt (2.0 - 2.5 điểm) trong kì thi vào 10 THPT công lập',
    coreTheory: [
      'Phương trình bậc hai một ẩn có dạng: ax² + bx + c = 0 (a ≠ 0).',
      'Biệt thức Delta: Δ = b² - 4ac.\n• Δ > 0: Phương trình có 2 nghiệm phân biệt: x1,2 = (-b ± √Δ) / (2a).\n• Δ = 0: Phương trình có nghiệm kép: x1 = x2 = -b / (2a).\n• Δ < 0: Phương trình vô nghiệm.',
      'Nếu b chẵn (b = 2b\'): Dùng Δ\' = b\'² - ac để tính toán nhanh hơn.',
      'Định lí Vi-ét: Nếu phương trình ax² + bx + c = 0 (a ≠ 0) có nghiệm thì:\nS = x1 + x2 = -b / a\nP = x1 · x2 = c / a.',
      'Nhẩm nghiệm đặc biệt:\n• Nếu a + b + c = 0 ➔ x1 = 1, x2 = c/a.\n• Nếu a - b + c = 0 ➔ x1 = -1, x2 = -c/a.'
    ],
    goldenFormulas: [
      {
        title: 'Hệ thức Vi-ét kinh điển',
        formula: 'x1 + x2 = -b / a   |   x1 · x2 = c / a',
        note: 'Chỉ áp dụng khi phương trình CÓ NGHIỆM (Δ ≥ 0)',
        highlight: true
      },
      {
        title: 'Các biểu thức đối xứng thường gặp',
        formula: 'x1² + x2² = S² - 2P  |  (x1 - x2)² = S² - 4P  |  x1³ + x2³ = S³ - 3SP',
        note: 'Biến đổi mọi biểu thức đối xứng về S và P',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán: Tìm tham số m để phương trình thỏa mãn hệ thức nghiệm',
        method: 'Bước 1: Tìm điều kiện để phương trình có nghiệm: a ≠ 0 và Δ ≥ 0 (hoặc Δ > 0 nếu đề bài yêu cầu 2 nghiệm phân biệt).\nBước 2: Viết hệ thức Vi-ét theo m: S = x1 + x2, P = x1 · x2.\nBước 3: Biến đổi hệ thức đề bài cho về S và P, sau đó thay m vào để giải tìm m.\nBước 4: Đối chiếu điều kiện ở Bước 1 và kết luận.',
        example: {
          problem: 'Cho phương trình: x² - 2(m - 1)x + m² - 4 = 0. Tìm m để phương trình có 2 nghiệm phân biệt thỏa mãn x1² + x2² = 16.',
          solution: 'Ta có a = 1 ≠ 0, b\' = -(m - 1), c = m² - 4.\nΔ\' = (m - 1)² - 1 · (m² - 4) = m² - 2m + 1 - m² + 4 = 5 - 2m.\nĐể PT có 2 nghiệm phân biệt thì Δ\' > 0 ⇔ 5 - 2m > 0 ⇔ m < 5/2.\nTheo Vi-ét: S = x1 + x2 = 2(m - 1), P = x1 · x2 = m² - 4.\nBiến đổi: x1² + x2² = (x1 + x2)² - 2x1x2 = 16\n⇔ 4(m - 1)² - 2(m² - 4) = 16\n⇔ 4(m² - 2m + 1) - 2m² + 8 = 16\n⇔ 2m² - 8m - 4 = 0 ⇔ m² - 4m - 2 = 0.\nGiải ra m = 2 ± √6.\nĐối chiếu điều kiện m < 2.5 (vì √6 ≈ 2.45 nên 2 + √6 ≈ 4.45 > 2.5 bị loại; 2 - √6 ≈ -0.45 < 2.5 thỏa mãn).\nVậy m = 2 - √6.',
          tips: 'Cực kì nhiều học sinh bị trừ 0.5 điểm vì quên đối chiếu điều kiện Delta > 0!'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Quên xét điều kiện a ≠ 0 và Δ ≥ 0 trước khi dùng Vi-ét.',
        correction: 'Nếu phương trình vô nghiệm thì không tồn tại x1, x2, do đó không thể dùng Vi-ét.',
        explanation: 'Luôn tìm điều kiện có nghiệm trước tiên.'
      },
      {
        mistake: 'Nhầm dấu tổng Vi-ét: x1 + x2 = b/a (SAI dấu trừ).',
        correction: 'x1 + x2 = -b/a (phải có dấu trừ!).',
        explanation: 'Nhớ câu: Tổng đổi dấu (-b/a), Tích giữ dấu (c/a).'
      }
    ],
    miniQuiz: [
      {
        question: 'Phương trình 2x² - 5x + 3 = 0 có hai nghiệm là:',
        options: ['x1 = 1, x2 = 3/2', 'x1 = -1, x2 = -3/2', 'x1 = 1, x2 = -3/2', 'x1 = 2, x2 = 3'],
        correctAnswer: 0,
        explanation: 'Phương trình có a + b + c = 2 + (-5) + 3 = 0 nên có nghiệm x1 = 1 và x2 = c/a = 3/2.'
      },
      {
        question: 'Nếu x1, x2 là nghiệm của phương trình x² - 6x + 2 = 0 thì x1² + x2² bằng:',
        options: ['32', '34', '36', '40'],
        correctAnswer: 0,
        explanation: 'Ta có S = 6, P = 2. Khi đó x1² + x2² = S² - 2P = 6² - 2 · 2 = 36 - 4 = 32.'
      }
    ]
  },
  {
    id: 'k9-c3-b1',
    grade: 'Toán 9',
    chapter: 'Chương 3: Hệ thức lượng trong tam giác vuông',
    chapterNumber: 3,
    lessonNumber: 1,
    title: 'Hệ Thức Lượng & Tỉ Số Lượng Giác Góc Nhọn',
    category: 'Hình học & Đo lường',
    readingTimeMinutes: 7,
    examRelevance: 'Câu tính toán thực tế (bóng cột cờ, thang dựa tường, ngọn hải đăng) 1.0 - 1.5 điểm',
    coreTheory: [
      'Cho ΔABC vuông tại A, đường cao AH (BC = a, AC = b, AB = c, AH = h, BH = c\', CH = b\'):',
      '1. Định lí Pytago: b² + c² = a²',
      '2. Hệ thức cạnh góc vuông và hình chiếu: b² = a · b\'; c² = a · c\'',
      '3. Hệ thức đường cao: h² = b\' · c\'',
      '4. Hệ thức tích: b · c = a · h',
      '5. Nghịch đảo bình phương đường cao: 1 / h² = 1 / b² + 1 / c²',
      'Tỉ số lượng giác góc nhọn (Sin đi học, Cos khóc cười, Tan đoàn kết, Cot kết đoàn):\n• sin α = Đối / Huyền\n• cos α = Kề / Huyền\n• tan α = Đối / Kề\n• cot α = Kề / Đối'
    ],
    goldenFormulas: [
      {
        title: 'Bộ ngũ hệ thức lượng trong tam giác vuông',
        formula: 'b² = a · b\' | c² = a · c\' | h² = b\' · c\' | b · c = a · h | 1/h² = 1/b² + 1/c²',
        note: 'Vẽ hình chuẩn và xác định đúng hình chiếu của từng cạnh',
        highlight: true
      },
      {
        title: 'Công thức lượng giác cơ bản',
        formula: 'sin²α + cos²α = 1   |   tanα = sinα / cosα   |   tanα · cotα = 1',
        note: 'Hai góc phụ nhau: sin góc này bằng cos góc kia',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng toán thực tế: Đo chiều cao cây / tòa nhà nhờ bóng nắng',
        method: 'Dùng tỉ số tan: Chiều cao = Chiều dài bóng nắng · tan(góc nâng ánh sáng mặt trời).',
        example: {
          problem: 'Một cột cờ có bóng trên mặt đất dài 12m khi góc tạo bởi tia nắng mặt trời với mặt đất là 35°. Tính chiều cao cột cờ (làm tròn đến chữ số thập phân thứ nhất).',
          solution: 'Gọi chiều cao cột cờ là h (m).\nTrong tam giác vuông tạo bởi cột cờ, mặt đất và tia nắng, ta có:\ntan 35° = h / 12 ➔ h = 12 · tan 35° ≈ 12 · 0.7002 ≈ 8.4 (m).\nVậy cột cờ cao khoảng 8.4 mét.',
          tips: 'Cạnh đối = Cạnh kề · tan (góc đối diện).'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Áp dụng hệ thức lượng cho tam giác KHÔNG VUÔNG (hoặc đường cao không kẻ từ góc vuông).',
        correction: 'Chỉ được dùng khi tam giác đã được chứng minh vuông VÀ có đường cao tương ứng từ đỉnh góc vuông.',
        explanation: 'Luôn ghi rõ: "Xét ΔABC vuông tại A có đường cao AH".'
      }
    ],
    miniQuiz: [
      {
        question: 'Cho ΔABC vuông tại A có AB = 3cm, AC = 4cm. Độ dài đường cao AH là:',
        options: ['2.4 cm', '2.5 cm', '5 cm', '1.2 cm'],
        correctAnswer: 0,
        explanation: 'BC = √(3² + 4²) = 5cm. Ta có AB · AC = BC · AH ➔ AH = (3 · 4) / 5 = 12 / 5 = 2.4 cm.'
      }
    ]
  },
  {
    id: 'k9-c4-b1',
    grade: 'Toán 9',
    chapter: 'Chương 4: Đường tròn & Tứ giác nội tiếp',
    chapterNumber: 4,
    lessonNumber: 1,
    title: 'Góc Với Đường Tròn & 4 Dấu Hiệu Nhận Biết Tứ Giác Nội Tiếp',
    category: 'Hình học & Đo lường',
    readingTimeMinutes: 8,
    examRelevance: 'Câu hình học ý 1-2 (1.5 điểm) - Bắt buộc phải lấy trọn điểm trong bài thi vào 10',
    coreTheory: [
      'Góc ở tâm: Có số đo bằng số đo của cung bị chắn.',
      'Góc nội tiếp: Có số đo bằng MỘT NỬA số đo của cung bị chắn. (Góc nội tiếp chắn nửa đường tròn là góc vuông 90°).',
      'Góc tạo bởi tia tiếp tuyến và dây cung: Bằng một nửa số đo cung bị chắn và bằng góc nội tiếp cùng chắn cung đó.',
      'Định nghĩa tứ giác nội tiếp: Là tứ giác có 4 đỉnh cùng nằm trên một đường tròn.',
      'Tính chất: Trong một tứ giác nội tiếp, tổng hai góc đối diện luôn bằng 180°: ∠A + ∠C = 180°.'
    ],
    goldenFormulas: [
      {
        title: '4 Dấu hiệu nhận biết Tứ giác nội tiếp',
        formula: '1) Tổng hai góc đối bằng 180°\n2) Hai đỉnh kề nhau cùng nhìn một cạnh dưới hai góc bằng nhau (cùng nhìn góc α)\n3) Góc ngoài tại một đỉnh bằng góc trong của đỉnh đối diện\n4) Bốn đỉnh cách đều một điểm cố định',
        note: 'Dấu hiệu 1 (hai góc vuông đối đỉnh) và dấu hiệu 2 (hai đỉnh cùng nhìn 90°) phổ biến nhất!',
        highlight: true
      }
    ],
    problemTypes: [
      {
        name: 'Dạng chứng minh: Tứ giác nội tiếp có tổng hai góc đối bằng 180°',
        method: 'Bước 1: Chỉ ra hai góc đối diện của tứ giác (thường là hai góc vuông 90° do tiếp tuyến hoặc đường cao tạo thành).\nBước 2: Tính tổng hai góc: 90° + 90° = 180°.\nBước 3: Kết luận tứ giác nội tiếp đường tròn.',
        example: {
          problem: 'Từ điểm M nằm ngoài đường tròn (O), kẻ hai tiếp tuyến MA, MB với đường tròn (A, B là các tiếp điểm). Chứng minh tứ giác MAOB nội tiếp.',
          solution: 'Vì MA là tiếp tuyến của (O) tại A nên OA ⊥ MA ➔ ∠OAM = 90°.\nVì MB là tiếp tuyến của (O) tại B nên OB ⊥ MB ➔ ∠OBM = 90°.\nXét tứ giác MAOB có:\n∠OAM + ∠OBM = 90° + 90° = 180°.\nMà hai góc này ở vị trí đối diện nhau.\nVậy tứ giác MAOB nội tiếp đường tròn (đường kính OM).',
          tips: 'Luôn nêu rõ tâm đường tròn ngoại tiếp (trung điểm cạnh huyền OM) để ghi điểm tuyệt đối.'
        }
      }
    ],
    commonMistakes: [
      {
        mistake: 'Ghi nhầm: "Hai đỉnh kề nhau cùng nhìn một cạnh dưới hai góc đối nhau".',
        correction: 'Phải là "cùng nhìn một đoạn thẳng dưới hai góc BẰNG NHAU" (thường cùng bằng 90°).',
        explanation: 'Đó là tính chất của hai góc nội tiếp cùng chắn một cung.'
      }
    ],
    miniQuiz: [
      {
        question: 'Góc nội tiếp chắn nửa đường tròn luôn có số đo bằng:',
        options: ['45°', '60°', '90°', '180°'],
        correctAnswer: 2,
        explanation: 'Cung nửa đường tròn có số đo 180°, nên góc nội tiếp bằng 180° / 2 = 90°.'
      },
      {
        question: 'Tứ giác ABCD nội tiếp đường tròn có góc A = 80°. Số đo góc C (đối diện góc A) là:',
        options: ['80°', '100°', '120°', '90°'],
        correctAnswer: 1,
        explanation: 'Tổng hai góc đối của tứ giác nội tiếp bằng 180°, suy ra ∠C = 180° - 80° = 100°.'
      }
    ]
  }
];
