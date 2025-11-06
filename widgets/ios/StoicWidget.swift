// widgets/ios/StoicWidget.swift

import WidgetKit
import SwiftUI
import Foundation

// --- 1. Veri Modeli (API'den gelen JSON ile eşleşen) ---
private struct StoicQuote: Codable {
    let author: String
    let quote: String
}

// --- 2. Widget'ın Zaman Çizelgesi Veri Yapısı ---
private struct StoicQuoteEntry: TimelineEntry {
    let date: Date
    let quote: StoicQuote?
}

// --- 3. Hata Yönetimi ---
private enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case decodingError(Error)
}

// --- 4. Veri Sağlayıcı (Provider) ---
private struct Provider: TimelineProvider {

    // DÜZELTME 1: Derleyiciye 'Entry' tipinin ne olduğunu açıkça söylüyoruz.
    public typealias Entry = StoicQuoteEntry

    // (fetchDataFromAPI fonksiyonu değişmedi)
    func fetchDataFromAPI() async throws -> StoicQuote {
        guard let url = URL(string: "https://stoic-quotes.com/api/quote") else {
            throw APIError.invalidURL
        }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decodedQuote = try JSONDecoder().decode(StoicQuote.self, from: data)
            return decodedQuote
        } catch let error as DecodingError {
            print("WIDGET JSON Decoding Error: \(error)")
            throw APIError.decodingError(error)
        } catch {
            print("WIDGET Network Error: \(error.localizedDescription)")
            throw APIError.networkError(error)
        }
    }

    // DÜZELTME 2: Metod imzası 'Entry' tipini kullanmalı.
    func placeholder(in context: Context) -> Entry {
        StoicQuoteEntry(date: Date(), quote: StoicQuote(author: "Marcus Aurelius", quote: "Look within. Within is the fountain of good."))
    }

    // DÜZELTME 3: Metod imzası 'Entry' tipini kullanmalı.
    func getSnapshot(in context: Context, completion: @escaping (Entry) -> ()) {
        let entry = StoicQuoteEntry(date: Date(), quote: placeholder(in: context).quote)
        completion(entry)
    }

    // DÜZELTME 4: Metod imzası 'Entry' tipini kullanmalı.
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let currentDate = Date()
        let nextUpdateDate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!

        Task {
            let entry: StoicQuoteEntry // Bu 'StoicQuoteEntry' olarak kalabilir, çünkü 'Entry' ile aynı
            do {
                let fetchedQuote = try await fetchDataFromAPI()
                entry = StoicQuoteEntry(date: currentDate, quote: fetchedQuote)
            } catch {
                print("Failed to fetch quote for widget: \(error)")
                entry = StoicQuoteEntry(date: currentDate, quote: nil)
            }

            let timeline = Timeline(entries: [entry], policy: .after(nextUpdateDate))
            completion(timeline)
        }
    }
}

// --- 5. Widget Arayüzü (SwiftUI View) ---
// (Değişiklik yok)
private struct StoicWidgetEntryView : View {
    var entry: Provider.Entry // Bu zaten 'Entry' kullandığı için doğruydu

    var quoteToShow: StoicQuote {
        entry.quote ?? StoicQuote(author: "System", quote: "Failed to load quote. Tap to retry.")
    }

    var body: some View {
        ZStack {
            ContainerRelativeShape()
            .fill(.background.secondary)

            VStack(alignment: .leading, spacing: 6) {
                Text("\"\(quoteToShow.quote)\"")
                .font(.body)
                .foregroundColor(Color.primary)
                .minimumScaleFactor(0.8)
                .padding(.bottom, 4)

                Spacer()

                Text("- \(quoteToShow.author)")
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(Color.secondary)
            }
            .padding(12)
        }
        .widgetURL(URL(string: "stoicapp://open"))
    }
}


// --- 6. ANA WIDGET YAPISI ---
// (Değişiklik yok)
struct StoicWidget: Widget {
    let kind: String = "StoicWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            StoicWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Stoic Quote")
        .description("Your hourly dose of wisdom.")
        .supportedFamilies([.systemMedium])
    }
}

// --- 7. ÖNİZLEME (Xcode'da görmek için) ---
// (Değişiklik yok)
#Preview(as: .systemMedium) {
    StoicWidget()
} timeline: {
    StoicQuoteEntry(date: Date(), quote: StoicQuote(author: "Marcus Aurelius", quote: "The happiness of your life depends upon the quality of your thoughts."))
    StoicQuoteEntry(date: Date(), quote: nil)
}