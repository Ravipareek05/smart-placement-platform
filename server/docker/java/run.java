import java.util.*;

public class run {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        String input = sc.nextLine();

        // Example input: [1,2,3]
        input = input.replaceAll("[\\[\\]\\s]", "");
        if (input.isEmpty()) {
            System.out.println(0);
            return;
        }

        String[] parts = input.split(",");
        int sum = 0;
        for (String p : parts) {
            sum += Integer.parseInt(p);
        }

        System.out.println(sum);
    }
}